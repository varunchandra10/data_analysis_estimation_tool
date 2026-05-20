from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd

from services.ai_service import ai_recommendations_service
from services.cleaning_service import apply_outliers_service, clean_missing_values_service, process_duplicates_service
from services.validation_service import run_validation_service
from services.report_engine import build_pdf_report
from services.versioning_engine import create_version, list_versions, read_dataset_file, get_manifest, DEFAULT_PROJECT_ID
from services.weighting_engine import run_weight_estimation
from core.config import DATASETS_DIR
from utils.dataset_storage import resolve_dataset_name, temp_root
from utils.file_utils import safe_json_replace, validate_file_path
from utils.log_utils import log_calls
from utils.stats_utils import get_comprehensive_stats

def _build_schema(df: pd.DataFrame) -> list[dict[str, Any]]:
    schema: list[dict[str, Any]] = []
    for column in df.columns:
        schema.append({
            'column': column,
            'type': str(df[column].dtype),
            'pandas_dtype': str(df[column].dtype),
        })
    return schema


def _build_cleaning_strategies(df: pd.DataFrame) -> dict[str, str]:
    strategies: dict[str, str] = {}
    for column in df.columns:
        series = df[column].dropna()
        if series.empty:
            continue
        strategies[column] = 'median' if pd.api.types.is_numeric_dtype(df[column]) else 'most_frequent'
    return strategies


def _build_validation_rules(df: pd.DataFrame) -> list[dict[str, Any]]:
    return [
        {
            'column': column,
            'operator': 'not_null',
            'value': None,
            'severity': 'medium',
        }
        for column in df.columns
    ]


def _select_weight_columns(df: pd.DataFrame) -> tuple[pd.DataFrame, str, str]:
    numeric_columns = [column for column in df.columns if pd.api.types.is_numeric_dtype(df[column])]

    working_df = df.copy()

    if len(numeric_columns) >= 2:
        return working_df, numeric_columns[0], numeric_columns[1]

    if len(numeric_columns) == 1:
        working_df['__pipeline_weight__'] = 1.0
        return working_df, numeric_columns[0], '__pipeline_weight__'

    working_df['__pipeline_value__'] = pd.RangeIndex(start=0, stop=len(working_df), step=1).astype(float)
    working_df['__pipeline_weight__'] = 1.0
    return working_df, '__pipeline_value__', '__pipeline_weight__'


def _stage_version_name(index: int, label: str) -> str:
    return f'v{index}_{label}'


def _latest_dataset_path(file_path: str | None) -> Path:
    if not file_path:
        raise FileNotFoundError('file_path is required to run the pipeline.')

    return validate_file_path(file_path)


def _next_version_start(dataset_name: str) -> int:
    versions = [item for item in list_versions() if item.get('dataset_name') == dataset_name]
    highest = 0

    for item in versions:
        version_name = str(item.get('version', ''))
        prefix = version_name.split('_', 1)[0]
        if prefix.startswith('v') and prefix[1:].isdigit():
            highest = max(highest, int(prefix[1:]))

    return highest + 1


def _build_report_payload(dataset_path: Path, dataset_name: str, df: pd.DataFrame, cleaning_result: dict[str, Any], duplicate_result: dict[str, Any], outlier_result: dict[str, Any], validation_result: dict[str, Any], weighting_result: dict[str, Any], ai_result: dict[str, Any]) -> dict[str, Any]:
    stats = get_comprehensive_stats(df)
    metadata = {
        'filename': dataset_name,
        'datasetName': dataset_name,
        'rows': int(df.shape[0]),
        'columns': int(df.shape[1]),
        'file_path': str(dataset_path),
        'generated_at': datetime.utcnow().isoformat(timespec='seconds') + 'Z',
        'null_counts': cleaning_result.get('null_counts', {}),
    }

    return {
        'metadata': {
            'generatedAt': metadata['generated_at'],
            'datasetName': dataset_name,
            'analysisType': 'Automated Pipeline Report',
        },
        'dataset': {
            'metadata': metadata,
            'schema': _build_schema(df),
            'previewRows': min(5, len(df)),
            'totalRows': metadata['rows'],
            'totalColumns': metadata['columns'],
            'nullCounts': metadata['null_counts'],
            'statistics': stats,
        },
        'cleaning': {
            'nullAnalysisAvailable': True,
            'nullCounts': cleaning_result.get('null_counts', {}),
        },
        'duplicates': {
            'available': True,
            'resultPath': duplicate_result.get('file_path'),
            'finalRowCount': duplicate_result.get('preview_rows', metadata['rows']),
            'duplicatesRemoved': duplicate_result.get('removed_count', 0),
        },
        'outliers': {
            'available': True,
            'resultPath': outlier_result.get('file_path'),
            'previewAvailable': True,
            'rowsAfter': outlier_result.get('preview_rows', metadata['rows']),
            'total_outliers': outlier_result.get('total_outliers', 0),
            'thresholds': outlier_result.get('thresholds', {}),
        },
        'validation': {
            'available': True,
            'resultPath': validation_result.get('file_path'),
            'failedRules': validation_result.get('total_violations', 0),
            'severity_counts': validation_result.get('severity_counts', {}),
        },
        'weighting': {
            'available': True,
            'resultPath': weighting_result.get('file_path'),
            'weights': weighting_result.get('weights', {}),
            'confidence_interval': weighting_result.get('results', {}).get('confidence_interval'),
            'moe': weighting_result.get('results', {}).get('margin_of_error'),
        },
        'statistics': stats,
        'ai': {
            'status': ai_result.get('status', 'success'),
            'totalRecommendations': len(ai_result.get('recommendations', [])),
            'recommendations': ai_result.get('recommendations', []),
        },
    }


def _create_or_reuse_version(
    dataset_source: Any,
    dataset_name: str,
    version_name: str,
    parent: str | None,
    stage_name: str,
    operations: list[str],
    affected_rows: int,
    extra_manifest: dict[str, Any],
) -> dict[str, Any]:
    try:
        return create_version(
            dataset_source=dataset_source,
            dataset_name=dataset_name,
            version_name=version_name,
            parent=parent,
            stage_name=stage_name,
            operations=operations,
            affected_rows=affected_rows,
            extra_manifest=extra_manifest,
        )
    except FileExistsError:
        version_dir = DATASETS_DIR / resolve_dataset_name(dataset_name) / 'processed' / 'versions' / version_name
        dataset_file = version_dir / 'dataset.csv'
        return {
            'project_id': DEFAULT_PROJECT_ID,
            'dataset_name': dataset_name,
            'version': version_name,
            'parent': parent,
            'stage_name': stage_name,
            'affected_rows': affected_rows,
            'lineage': [version_name] if parent is None else [parent, version_name],
            'version_dir': str(version_dir),
            'dataset_path': str(dataset_file),
            'manifest_path': str((version_dir.parent / 'manifests' / f'{version_name}_manifest.json')),
        }


@log_calls
async def run_pipeline(payload: dict[str, Any]) -> dict[str, Any]:
    dataset_path = _latest_dataset_path(payload.get('file_path'))
    dataset_name = resolve_dataset_name(dataset_path)
    working_df = read_dataset_file(dataset_path)

    stage_results: list[dict[str, Any]] = []
    lineage: list[dict[str, Any]] = []
    current_version: str | None = 'raw'

    raw_timestamp = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    version_result = _create_or_reuse_version(
        dataset_source=dataset_path,
        dataset_name=dataset_name,
        version_name='raw',
        parent=None,
        stage_name='raw',
        operations=['ingest'],
        affected_rows=int(working_df.shape[0]),
        extra_manifest={
            'source_file': str(dataset_path),
        },
    )
    lineage.append(version_result)
    stage_results.append({
        'stage': 'raw',
        'status': 'completed',
        'version': 'raw',
        'file_path': str(dataset_path),
        'rows': int(working_df.shape[0]),
        'timestamp': raw_timestamp,
    })

    cleaning_result = await clean_missing_values_service({
        'file_path': str(dataset_path),
        'strategies': _build_cleaning_strategies(working_df),
    })
    working_df = read_dataset_file(cleaning_result['file_path'])

    duplicate_result = await process_duplicates_service({
        'file_path': str(cleaning_result['file_path']),
        'strategy': 'remove',
    })
    working_df = read_dataset_file(duplicate_result['file_path'])
    current_version = 'v1_preprocessed'
    preprocessing_timestamp = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    version_result = _create_or_reuse_version(
        dataset_source=working_df,
        dataset_name=dataset_name,
        version_name=current_version,
        parent=lineage[-1]['version'],
        stage_name='preprocessing',
        operations=['missing_value_cleaning', 'duplicate_handling'],
        affected_rows=int(cleaning_result.get('rows_affected', 0)) + int(duplicate_result.get('removed_count', 0)),
        extra_manifest={
            'cleaning_result': cleaning_result,
            'duplicate_result': duplicate_result,
        },
    )
    lineage.append(version_result)
    stage_results.append({
        'stage': 'preprocessing',
        'status': 'completed',
        'version': current_version,
        'file_path': version_result.get('dataset_path'),
        'rows': int(working_df.shape[0]),
        'rows_affected': int(cleaning_result.get('rows_affected', 0)) + int(duplicate_result.get('removed_count', 0)),
        'timestamp': preprocessing_timestamp,
    })

    numeric_columns = [column for column in working_df.columns if pd.api.types.is_numeric_dtype(working_df[column])]
    outlier_details: dict[str, Any] = {'total_outliers': 0, 'thresholds': {}}
    outlier_path = str(duplicate_result['file_path'])
    for column in numeric_columns:
        outlier_result = await apply_outliers_service({
            'file_path': outlier_path,
            'column': column,
            'method': 'winsorization',
        })
        outlier_path = outlier_result['file_path']
        outlier_details['total_outliers'] += int(outlier_result.get('total_outliers', 0))
        if outlier_result.get('thresholds'):
            outlier_details['thresholds'][column] = outlier_result['thresholds']

    working_df = read_dataset_file(outlier_path)
    current_version = 'v2_outliers'
    outlier_timestamp = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    version_result = _create_or_reuse_version(
        dataset_source=working_df,
        dataset_name=dataset_name,
        version_name=current_version,
        parent=lineage[-1]['version'],
        stage_name='outliers',
        operations=['outlier_processing'],
        affected_rows=int(outlier_details['total_outliers']),
        extra_manifest={
            'outlier_details': outlier_details,
        },
    )
    lineage.append(version_result)
    outlier_details['file_path'] = outlier_path
    outlier_details['preview_rows'] = int(working_df.shape[0])
    stage_results.append({
        'stage': 'outliers',
        'status': 'completed',
        'version': current_version,
        'file_path': outlier_path,
        'total_outliers': outlier_details['total_outliers'],
        'timestamp': outlier_timestamp,
    })

    validation_result = await run_validation_service({
        'file_path': outlier_path,
        'rules': _build_validation_rules(working_df),
    })
    current_version = 'v3_validation'
    validation_timestamp = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    version_result = _create_or_reuse_version(
        dataset_source=working_df,
        dataset_name=dataset_name,
        version_name=current_version,
        parent=lineage[-1]['version'],
        stage_name='validation',
        operations=['rule_validation'],
        affected_rows=int(validation_result.get('total_violations', 0)),
        extra_manifest={'validation': validation_result},
    )
    lineage.append(version_result)
    stage_results.append({
        'stage': 'validation',
        'status': 'completed',
        'version': current_version,
        'file_path': validation_result.get('file_path'),
        'total_violations': validation_result.get('total_violations', 0),
        'timestamp': validation_timestamp,
    })

    weighting_df, value_column, weight_column = _select_weight_columns(working_df)
    weighting_result = run_weight_estimation(
        df=weighting_df,
        value_column=value_column,
        weight_column=weight_column,
        analysis_type='mean',
        confidence_level=float(payload.get('confidence_level', 0.95)),
    )
    current_version = 'v4_weighted'
    version_result = _create_or_reuse_version(
        dataset_source=working_df,
        dataset_name=dataset_name,
        version_name=current_version,
        parent=lineage[-1]['version'],
        stage_name='weighting',
        operations=['weight_estimation'],
        affected_rows=0,
        extra_manifest={
            'value_column': value_column,
            'weight_column': weight_column,
            'weighting': weighting_result,
        },
    )
    lineage.append(version_result)
    weighted_snapshot_path = Path(version_result['dataset_path'])
    weighting_timestamp = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    stage_results.append({
        'stage': 'weighting',
        'status': 'completed',
        'version': current_version,
        'value_column': value_column,
        'weight_column': weight_column,
        'timestamp': weighting_timestamp,
    })

    ai_result = await ai_recommendations_service({
        'file_path': str(weighted_snapshot_path),
        'schema': _build_schema(working_df),
    })
    stage_results.append({
        'stage': 'ai',
        'status': 'completed',
        'recommendations': len(ai_result.get('recommendations', [])),
        'timestamp': datetime.utcnow().isoformat(timespec='seconds') + 'Z',
    })

    report_payload = _build_report_payload(
        dataset_path=weighted_snapshot_path,
        dataset_name=dataset_name,
        df=working_df,
        cleaning_result=cleaning_result,
        duplicate_result={**duplicate_result, 'preview_rows': int(working_df.shape[0])},
        outlier_result=outlier_details,
        validation_result=validation_result,
        weighting_result=weighting_result,
        ai_result=ai_result,
    )
    pdf_bytes = build_pdf_report(report_payload)
    report_dir = temp_root() / 'pipeline_reports'
    report_dir.mkdir(parents=True, exist_ok=True)
    report_path = report_dir / f'{dataset_name}_{current_version}.pdf'
    report_path.write_bytes(pdf_bytes)
    stage_results.append({
        'stage': 'report_generation',
        'status': 'completed',
        'file_path': str(report_path),
        'size_bytes': len(pdf_bytes),
        'timestamp': datetime.utcnow().isoformat(timespec='seconds') + 'Z',
    })

    return {
        'pipeline_status': 'completed',
        'dataset_name': dataset_name,
        'current_version': current_version,
        'steps_completed': ['raw', 'preprocessing', 'outliers', 'validation', 'weighting', 'ai', 'report_generation'],
        'stage_results': stage_results,
        'version_lineage': lineage,
        'report_path': str(report_path),
        'report_size_bytes': len(pdf_bytes),
        'summary': {
            'rows': int(working_df.shape[0]),
            'columns': int(working_df.shape[1]),
            'null_counts': safe_json_replace(cleaning_result.get('null_counts', {})),
            'validation_violations': int(validation_result.get('total_violations', 0)),
            'ai_recommendations': len(ai_result.get('recommendations', [])),
        },
    }
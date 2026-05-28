from __future__ import annotations

import asyncio
from datetime import datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

import pandas as pd

from services.ai.recommendation_engine import orchestrate_ai_recommendations
from services.cleaning_service import apply_outliers_service, clean_missing_values_service, process_duplicates_service
from services.validation_service import run_validation_service
from services.reporting.engine import build_pdf_report
from services.versioning.engine import create_version, list_versions, read_dataset_file, get_manifest, DEFAULT_PROJECT_ID
from services.statistics.weighting_engine import run_weight_estimation
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


def _build_report_payload(dataset_path, dataset_name, df, cleaning_result, duplicate_result, outlier_result, validation_result, weighting_result, ai_result):
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


def _sync_build_and_register_report(
    report_payload: dict[str, Any],
    dataset_name: str,
    current_version: str,
) -> tuple[Path, bytes, str]:
    """CPU + I/O heavy work extracted so it can run in a thread pool via run_in_executor.
    P2 FIX: prevents reportlab/matplotlib from blocking the async event loop.
    Returns (report_path, pdf_bytes, filename).
    """
    from utils.file_utils import resolve_safe_path
    from utils.hash_utils import generate_sha256
    from core.database import SessionLocal
    from models.dataset_model import Dataset
    from models.version_model import Version
    from models.report_model import Report
    from utils.log_utils import logger

    pdf_bytes = build_pdf_report(report_payload)
    report_dir = temp_root() / 'pipeline_reports'
    report_dir.mkdir(parents=True, exist_ok=True)
    report_path = report_dir / f'{dataset_name}_{current_version}.pdf'
    report_path.write_bytes(pdf_bytes)

    safe_report_path = resolve_safe_path(report_path)
    checksum = generate_sha256(safe_report_path)
    filename = safe_report_path.name

    db = SessionLocal()
    version_id: int | None = None
    try:
        ds = db.query(Dataset).filter(Dataset.dataset_name == dataset_name).first()
        dataset_id = ds.id if ds else 1

        ver = db.query(Version).filter(
            Version.dataset_id == dataset_id,
            Version.version_name == current_version,
        ).first()
        version_id = ver.id if ver else None

        db_report = Report(
            dataset_id=dataset_id,
            version_id=version_id,
            report_name=filename,
            report_path=str(safe_report_path),
            filename=filename,
            report_type='pdf',
            file_path=str(safe_report_path),
            checksum=checksum,
            status='active',
        )
        db.add(db_report)
        db.commit()
    except Exception as db_exc:
        if safe_report_path.exists():
            safe_report_path.unlink()
        raise db_exc
    finally:
        db.close()

    return report_path, pdf_bytes, filename


def _create_version_snapshot(
    dataset_source: Any,
    dataset_name: str,
    version_name: str,
    parent: str | None,
    stage_name: str,
    operations: list[str],
    affected_rows: int,
    extra_manifest: dict[str, Any],
) -> dict[str, Any]:
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


@log_calls
async def run_pipeline(payload: dict[str, Any]) -> dict[str, Any]:
    dataset_path = _latest_dataset_path(payload.get('file_path'))
    dataset_name = resolve_dataset_name(dataset_path)
    working_df = read_dataset_file(dataset_path)
    pipeline_run_id = uuid4().hex

    stage_results: list[dict[str, Any]] = []
    lineage: list[dict[str, Any]] = []
    current_version: str | None = None
    version_counter = _next_version_start(dataset_name)

    raw_version = _stage_version_name(version_counter, 'raw')
    version_counter += 1

    raw_timestamp = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    version_result = _create_version_snapshot(
        dataset_source=dataset_path,
        dataset_name=dataset_name,
        version_name=raw_version,
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
        'version': raw_version,
        'file_path': version_result.get('dataset_path'),
        'rows': int(working_df.shape[0]),
        'timestamp': raw_timestamp,
    })

    from services.audit_log_service import record_audit_log
    record_audit_log(
        dataset_name=dataset_name,
        action='raw',
        details={
            'version': raw_version,
            'rows_affected': int(working_df.shape[0]),
            'description': 'Pipeline raw snapshot created.',
        },
        status='success',
    )

    cleaning_result = await clean_missing_values_service({
        'file_path': str(dataset_path),
        'strategies': _build_cleaning_strategies(working_df),
        'df': working_df,
        'in_memory': True,
    })
    working_df = cleaning_result['df']

    duplicate_result = await process_duplicates_service({
        'file_path': str(dataset_path),
        'strategy': 'remove',
        'df': working_df,
        'in_memory': True,
    })
    working_df = duplicate_result['df']
    current_version = _stage_version_name(version_counter, 'preprocessed')
    version_counter += 1
    preprocessing_timestamp = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    version_result = _create_version_snapshot(
        dataset_source=working_df,
        dataset_name=dataset_name,
        version_name=current_version,
        parent=lineage[-1]['version'],
        stage_name='preprocessing',
        operations=['missing_value_cleaning', 'duplicate_handling'],
        affected_rows=int(cleaning_result.get('rows_affected', 0)) + int(duplicate_result.get('removed_count', 0)),
        extra_manifest={
            'cleaning_result': {k: v for k, v in cleaning_result.items() if k != 'df'},
            'duplicate_result': {k: v for k, v in duplicate_result.items() if k != 'df'},
        },
    )
    lineage.append(version_result)
    preprocessed_path = version_result.get('dataset_path')
    stage_results.append({
        'stage': 'preprocessing',
        'status': 'completed',
        'version': current_version,
        'file_path': preprocessed_path,
        'rows': int(working_df.shape[0]),
        'rows_affected': int(cleaning_result.get('rows_affected', 0)) + int(duplicate_result.get('removed_count', 0)),
        'data': {
            'cleaning': {
                'file_path': str(preprocessed_path),
                'rows_affected': int(cleaning_result.get('rows_affected', 0)),
                'null_counts': cleaning_result.get('null_counts', {}),
            },
            'duplicates': {
                'file_path': str(preprocessed_path),
                'removed_count': int(duplicate_result.get('removed_count', 0)),
                'final_rows': int(working_df.shape[0]),
            },
        },
        'timestamp': preprocessing_timestamp,
    })
    record_audit_log(
        dataset_name=dataset_name,
        action='preprocessing',
        details={
            'version': current_version,
            'rows_affected': int(cleaning_result.get('rows_affected', 0)) + int(duplicate_result.get('removed_count', 0)),
            'description': 'Missing values cleaned and duplicates processed.',
        },
        status='success',
    )

    numeric_columns = [column for column in working_df.columns if pd.api.types.is_numeric_dtype(working_df[column])]
    outlier_details: dict[str, Any] = {'total_outliers': 0, 'thresholds': {}}
    outlier_path = str(preprocessed_path)
    for column in numeric_columns:
        outlier_result = await apply_outliers_service({
            'file_path': outlier_path,
            'column': column,
            'method': 'winsorization',
            'df': working_df,
            'in_memory': True,
        })
        working_df = outlier_result['df']
        outlier_details['total_outliers'] += int(outlier_result.get('total_outliers', 0))
        if outlier_result.get('thresholds'):
            outlier_details['thresholds'][column] = outlier_result['thresholds']

    current_version = _stage_version_name(version_counter, 'outliers')
    version_counter += 1
    outlier_timestamp = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    version_result = _create_version_snapshot(
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
    outlier_saved_path = version_result.get('dataset_path')
    outlier_details['file_path'] = outlier_saved_path
    outlier_details['preview_rows'] = int(working_df.shape[0])
    stage_results.append({
        'stage': 'outliers',
        'status': 'completed',
        'version': current_version,
        'file_path': outlier_saved_path,
        'total_outliers': outlier_details['total_outliers'],
        'data': {
            'file_path': str(outlier_saved_path),
            'total_outliers': int(outlier_details['total_outliers']),
            'thresholds': outlier_details.get('thresholds', {}),
            'preview_rows': int(working_df.shape[0]),
        },
        'timestamp': outlier_timestamp,
    })
    record_audit_log(
        dataset_name=dataset_name,
        action='outliers',
        details={
            'version': current_version,
            'rows_affected': int(outlier_details['total_outliers']),
            'description': 'Outlier handling completed.',
            'thresholds': outlier_details.get('thresholds', {}),
        },
        status='success',
    )

    validation_result = await run_validation_service({
        'file_path': outlier_saved_path,
        'rules': _build_validation_rules(working_df),
        'df': working_df,
        'in_memory': True,
    })
    current_version = _stage_version_name(version_counter, 'validation')
    version_counter += 1
    validation_timestamp = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    version_result = _create_version_snapshot(
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
    validation_saved_path = version_result.get('dataset_path')
    validation_result['file_path'] = validation_saved_path
    stage_results.append({
        'stage': 'validation',
        'status': 'completed',
        'version': current_version,
        'file_path': validation_saved_path,
        'total_violations': validation_result.get('total_violations', 0),
        'data': {
            'file_path': str(validation_saved_path),
            'total_violations': int(validation_result.get('total_violations', 0)),
            'severity_counts': validation_result.get('severity_counts', {}),
            'violations': validation_result.get('violations', []),
        },
        'timestamp': validation_timestamp,
    })
    record_audit_log(
        dataset_name=dataset_name,
        action='validation',
        details={
            'version': current_version,
            'rows_affected': int(validation_result.get('total_violations', 0)),
            'description': 'Validation rules executed.',
            'severity_counts': validation_result.get('severity_counts', {}),
        },
        status='success',
    )

    weighting_df, value_column, weight_column = _select_weight_columns(working_df)
    weighting_result = run_weight_estimation(
        df=weighting_df,
        value_column=value_column,
        weight_column=weight_column,
        analysis_type='mean',
        confidence_level=float(payload.get('confidence_level', 0.95)),
    )
    current_version = _stage_version_name(version_counter, 'weighted')
    version_counter += 1
    version_result = _create_version_snapshot(
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
        'file_path': str(weighted_snapshot_path),
        'value_column': value_column,
        'weight_column': weight_column,
        'data': {
            'file_path': str(weighted_snapshot_path),
            'value_column': value_column,
            'weight_column': weight_column,
            'weights': weighting_result.get('weights', {}),
            'results': weighting_result.get('results', {}),
        },
        'timestamp': weighting_timestamp,
    })
    record_audit_log(
        dataset_name=dataset_name,
        action='weighting',
        details={
            'version': current_version,
            'rows_affected': 0,
            'description': 'Weight estimation completed.',
            'value_column': value_column,
            'weight_column': weight_column,
        },
        status='success',
    )

    orchestrate_result = await orchestrate_ai_recommendations({
        'file_path': str(weighted_snapshot_path),
        'schema': _build_schema(working_df),
    })
    ai_result = {
        'status': orchestrate_result.get('status', 'success'),
        'recommendations': orchestrate_result.get('data', {}).get('recommendations', []),
    }
    stage_results.append({
        'stage': 'ai',
        'status': 'completed',
        'recommendations': len(ai_result.get('recommendations', [])),
        'data': {
            'status': ai_result.get('status', 'success'),
            'recommendations': ai_result.get('recommendations', []),
        },
        'timestamp': datetime.utcnow().isoformat(timespec='seconds') + 'Z',
    })
    record_audit_log(
        dataset_name=dataset_name,
        action='ai',
        details={
            'version': current_version,
            'rows_affected': 0,
            'description': 'AI recommendations generated.',
            'recommendation_count': len(ai_result.get('recommendations', [])),
        },
        status='success',
    )

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

    # P2 FIX: run the CPU-heavy PDF build + file write + DB registration in a thread pool.
    # asyncio.get_event_loop().run_in_executor(None, fn, ...) offloads the blocking work
    # so other async requests are not starved during reportlab rendering.
    loop = asyncio.get_event_loop()
    report_path, pdf_bytes, filename = await loop.run_in_executor(
        None,
        _sync_build_and_register_report,
        report_payload,
        dataset_name,
        current_version,
    )

    # Pipeline-level audit log (uses version_id resolved inside the helper via DB query)
    record_audit_log(
        dataset_name=dataset_name,
        action='pipeline',
        details={
            'message': 'Automated pipeline executed successfully',
            'stages': [s['stage'] for s in stage_results],
        },
        status='success',
    )

    stage_results.append({
        'stage': 'report_generation',
        'status': 'completed',
        'file_path': str(report_path),
        'size_bytes': len(pdf_bytes),
        'data': {
            'file_path': str(report_path),
            'download_url': f'/api/reports/download/{filename}',
            'filename': filename,
            'size_bytes': len(pdf_bytes),
        },
        'timestamp': datetime.utcnow().isoformat(timespec='seconds') + 'Z',
    })
    record_audit_log(
        dataset_name=dataset_name,
        action='report_generation',
        details={
            'version': current_version,
            'rows_affected': 0,
            'description': 'Pipeline report generated.',
            'filename': filename,
        },
        status='success',
    )


    return {
        'pipeline_run_id': pipeline_run_id,
        'pipeline_status': 'completed',
        'dataset_name': dataset_name,
        'current_version': current_version,
        'final_dataset_path': str(weighted_snapshot_path),
        'current_dataset_path': str(weighted_snapshot_path),
        'steps_completed': ['raw', 'preprocessing', 'outliers', 'validation', 'weighting', 'ai', 'report_generation'],
        'stage_results': stage_results,
        'version_lineage': lineage,
        'report_path': str(report_path),
        'report_download_url': f'/api/reports/download/{filename}',
        'report_size_bytes': len(pdf_bytes),
        'summary': {
            'rows': int(working_df.shape[0]),
            'columns': int(working_df.shape[1]),
            'null_counts': safe_json_replace(cleaning_result.get('null_counts', {})),
            'validation_violations': int(validation_result.get('total_violations', 0)),
            'ai_recommendations': len(ai_result.get('recommendations', [])),
            'pipeline_run_id': pipeline_run_id,
        },
    }

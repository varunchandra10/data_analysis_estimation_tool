import pytest
import pandas as pd
from pathlib import Path
from unittest.mock import AsyncMock, patch
import shutil

from services.cleaning_service import clean_missing_values_service, process_duplicates_service, apply_outliers_service
from services.validation_service import run_validation_service
from services.ai.explanation_engine import orchestrate_ai_explanations
from services.ai.cache_engine import invalidate_ai_cache
from core.config import DATASETS_DIR


@pytest.mark.anyio
async def test_in_memory_cleaning_and_validation():
    df = pd.DataFrame({
        'A': [1.0, 2.0, None, 4.0],
        'B': ['x', 'y', 'y', 'x'],
        'C': [10.0, 20.0, 15.0, 1000.0]
    })
    
    # 1. Clean missing values in-memory
    res_clean = await clean_missing_values_service({
        'file_path': 'dummy.csv',
        'strategies': {'A': 'mean'},
        'df': df,
        'in_memory': True
    })
    assert res_clean['status'] == 'success'
    assert 'df' in res_clean
    df_clean = res_clean['df']
    assert df_clean['A'].isnull().sum() == 0
    assert not Path('dummy.csv').exists()

    # 2. Process duplicates in-memory
    df_with_dup = pd.concat([df_clean, df_clean.iloc[[0]]], ignore_index=True)
    res_dup = await process_duplicates_service({
        'file_path': 'dummy.csv',
        'strategy': 'remove',
        'df': df_with_dup,
        'in_memory': True
    })
    assert res_dup['status'] == 'success'
    assert res_dup['removed_count'] == 1
    assert len(res_dup['df']) == 4
    assert not Path('dummy.csv').exists()

    # 3. Apply outliers in-memory
    res_out = await apply_outliers_service({
        'file_path': 'dummy.csv',
        'column': 'C',
        'method': 'iqr',
        'df': df_clean,
        'in_memory': True
    })
    assert res_out['status'] == 'success'
    assert 'df' in res_out
    assert res_out['df']['C'].max() < 1000.0
    assert not Path('dummy.csv').exists()

    # 4. Run validation in-memory
    res_val = await run_validation_service({
        'file_path': 'dummy.csv',
        'rules': [{'column': 'A', 'operator': 'not_null', 'severity': 'medium'}],
        'df': df_clean,
        'in_memory': True
    })
    assert res_val['status'] == 'success'
    assert not Path('dummy.csv').exists()


@pytest.mark.anyio
@patch('services.ai.explanation_engine.ask_ollama', new_callable=AsyncMock)
async def test_ai_explanations_concurrency_and_cache(mock_ask, db_session):
    mock_ask.return_value = "Mocked AI explanation"
    
    # Register dummy dataset
    dummy_dir = DATASETS_DIR / "dummy_dataset" / "processed" / "versions" / "raw"
    dummy_dir.mkdir(parents=True, exist_ok=True)
    dummy_file = dummy_dir / "dataset.csv"
    dummy_file.touch()
    
    payload = {
        'file_path': str(dummy_file),
        'recommendations': [
            {'column': 'col1', 'recommendations': {'missing_value_method': 'mean'}, 'reason_codes': []},
            {'column': 'col2', 'recommendations': {'outlier_method': 'winsorize'}, 'reason_codes': []},
        ],
        'validation_summary': {'column': 'col1', 'rule_type': 'not_null', 'total_violations': 2},
    }
    
    # Clear any leftover cache from previous runs
    invalidate_ai_cache("dummy_dataset")
    
    # First execution: cache empty -> trigger mock ask_ollama
    res1 = await orchestrate_ai_explanations(payload)
    assert res1['status'] == 'success'
    assert res1['data']['cache_used'] is False
    assert mock_ask.call_count == 3
    
    # Second execution: cache populated -> skip ask_ollama calls
    mock_ask.reset_mock()
    res2 = await orchestrate_ai_explanations(payload)
    assert res2['status'] == 'success'
    assert res2['data']['cache_used'] is True
    assert mock_ask.call_count == 0
    
    # Clean up
    invalidate_ai_cache("dummy_dataset")
    shutil.rmtree(DATASETS_DIR / "dummy_dataset", ignore_errors=True)


@pytest.mark.anyio
@patch('services.pipeline_engine.orchestrate_ai_recommendations', new_callable=AsyncMock)
@patch('services.pipeline_engine.build_pdf_report')
async def test_pipeline_in_memory_run(mock_report, mock_ai_rec, db_session):
    mock_ai_rec.return_value = {
        'status': 'success',
        'data': {
            'recommendations': [
                {'column': 'col1', 'recommendations': {'missing_value_method': 'mean'}, 'reason_codes': []}
            ]
        }
    }
    mock_report.return_value = b"%PDF-1.4 dummy pdf content"

    # Setup database records for versioning
    # Register dummy dataset
    shutil.rmtree(DATASETS_DIR / "pipeline_test", ignore_errors=True)
    dummy_dir = DATASETS_DIR / "pipeline_test" / "processed" / "versions" / "raw"
    dummy_dir.mkdir(parents=True, exist_ok=True)
    dummy_file = dummy_dir / "dataset.csv"
    
    # Save a small dataframe as raw dataset
    df = pd.DataFrame({
        'col1': [1.0, 2.0, None, 4.0],
        'col2': [10, 20, 30, 40]
    })
    df.to_csv(dummy_file, index=False)
    
    # Run pipeline
    from services.pipeline_engine import run_pipeline
    result = await run_pipeline({
        'file_path': str(dummy_file),
        'confidence_level': 0.95
    })
    
    assert result['pipeline_status'] == 'completed'
    assert result['dataset_name'] == 'pipeline_test'
    assert result['current_version'].endswith('_weighted')
    
    # Check that stage results are complete
    stages = [s['stage'] for s in result['stage_results']]
    assert 'raw' in stages
    assert 'preprocessing' in stages
    assert 'outliers' in stages
    assert 'validation' in stages
    assert 'weighting' in stages
    assert 'ai' in stages
    assert 'report_generation' in stages
    
    # Cleanup
    invalidate_ai_cache("pipeline_test")
    shutil.rmtree(DATASETS_DIR / "pipeline_test", ignore_errors=True)

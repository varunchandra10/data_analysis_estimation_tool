from __future__ import annotations

import os
from pathlib import Path
from datetime import datetime
from core.database import SessionLocal
from models.dataset_model import Dataset
from models.version_model import Version
from models.report_model import Report
from models.ai_cache_model import AICacheRef
from utils.dataset_storage import DATASETS_ROOT, resolve_dataset_name
from services.ai.cache_engine import AI_CACHE_ROOT
from utils.hash_utils import generate_sha256
from core.config import REPORTS_DIR

def reconcile_dataset_refs() -> dict:
    db = SessionLocal()
    stale_dataset_refs = []
    stale_version_refs = []
    checksum_mismatches = []
    orphan_files = []
    
    try:
        # 1. Reconcile Dataset refs in DB -> Filesystem
        datasets = db.query(Dataset).all()
        registered_files = set()
        for ds in datasets:
            if ds.file_path:
                p = Path(ds.file_path)
                registered_files.add(p.resolve())
                if not p.exists():
                    stale_dataset_refs.append({
                        "id": ds.id,
                        "dataset_name": ds.dataset_name,
                        "file_path": ds.file_path,
                        "reason": "File does not exist on disk"
                    })
                else:
                    if ds.checksum:
                        actual = generate_sha256(p)
                        if actual != ds.checksum:
                            checksum_mismatches.append({
                                "type": "dataset",
                                "id": ds.id,
                                "name": ds.dataset_name,
                                "file_path": ds.file_path,
                                "db_checksum": ds.checksum,
                                "actual_checksum": actual
                            })
                        
        # 2. Reconcile Version refs in DB -> Filesystem
        versions = db.query(Version).all()
        for ver in versions:
            if ver.file_path:
                p = Path(ver.file_path)
                registered_files.add(p.resolve())
                if not p.exists():
                    stale_version_refs.append({
                        "id": ver.id,
                        "version_name": ver.version_name,
                        "file_path": ver.file_path,
                        "reason": "File does not exist on disk"
                    })
                else:
                    if ver.checksum:
                        actual = generate_sha256(p)
                        if actual != ver.checksum:
                            checksum_mismatches.append({
                                "type": "version",
                                "id": ver.id,
                                "name": ver.version_name,
                                "file_path": ver.file_path,
                                "db_checksum": ver.checksum,
                                "actual_checksum": actual
                            })
                        
        # 3. Find orphan dataset files (Filesystem -> DB)
        if DATASETS_ROOT.exists():
            for folder in DATASETS_ROOT.glob("*"):
                if folder.is_dir():
                    processed = folder / "processed"
                    if processed.exists():
                        for item in processed.glob("*"):
                            if item.is_file() and item.suffix in (".csv", ".xlsx"):
                                if item.resolve() not in registered_files:
                                    orphan_files.append(str(item))
                        versions_dir = processed / "versions"
                        if versions_dir.exists():
                            for ver_dir in versions_dir.glob("*"):
                                if ver_dir.is_dir():
                                    ds_file = ver_dir / "dataset.csv"
                                    if ds_file.exists() and ds_file.resolve() not in registered_files:
                                        orphan_files.append(str(ds_file))
                                        
    finally:
        db.close()
        
    return {
        "stale_dataset_refs": stale_dataset_refs,
        "stale_version_refs": stale_version_refs,
        "checksum_mismatches": checksum_mismatches,
        "orphan_files": orphan_files
    }

def reconcile_report_refs() -> dict:
    db = SessionLocal()
    stale_report_refs = []
    checksum_mismatches = []
    orphan_reports = []
    
    try:
        reports = db.query(Report).all()
        registered_reports = set()
        for rep in reports:
            if rep.file_path:
                p = Path(rep.file_path)
                registered_reports.add(p.resolve())
                if not p.exists():
                    stale_report_refs.append({
                        "id": rep.id,
                        "filename": rep.filename,
                        "file_path": rep.file_path,
                        "reason": "File does not exist on disk"
                    })
                else:
                    if rep.checksum:
                        actual = generate_sha256(p)
                        if actual != rep.checksum:
                            checksum_mismatches.append({
                                "type": "report",
                                "id": rep.id,
                                "name": rep.filename,
                                "file_path": rep.file_path,
                                "db_checksum": rep.checksum,
                                "actual_checksum": actual
                            })
                        
        # Find orphan reports
        if REPORTS_DIR.exists():
            for pdf in REPORTS_DIR.glob("*.pdf"):
                if pdf.resolve() not in registered_reports:
                    orphan_reports.append(str(pdf))
                    
        # Check subdirectories of datasets
        if DATASETS_ROOT.exists():
            for folder in DATASETS_ROOT.glob("*"):
                if folder.is_dir():
                    rep_folder = folder / "reports"
                    if rep_folder.exists():
                        for pdf in rep_folder.glob("*.pdf"):
                            if pdf.resolve() not in registered_reports:
                                orphan_reports.append(str(pdf))
                                
    finally:
        db.close()
        
    return {
        "stale_report_refs": stale_report_refs,
        "checksum_mismatches": checksum_mismatches,
        "orphan_reports": orphan_reports
    }

def reconcile_cache_refs() -> dict:
    db = SessionLocal()
    stale_cache_refs = []
    checksum_mismatches = []
    orphan_caches = []
    
    try:
        caches = db.query(AICacheRef).all()
        registered_caches = set()
        for c in caches:
            if c.cache_path:
                p = Path(c.cache_path)
                registered_caches.add(p.resolve())
                if not p.exists():
                    stale_cache_refs.append({
                        "id": c.id,
                        "cache_path": c.cache_path,
                        "reason": "File does not exist on disk"
                    })
                else:
                    if c.checksum:
                        actual = generate_sha256(p)
                        if actual != c.checksum:
                            checksum_mismatches.append({
                                "type": "cache",
                                "id": c.id,
                                "name": p.name,
                                "file_path": c.cache_path,
                                "db_checksum": c.checksum,
                                "actual_checksum": actual
                            })
                        
        # Find orphan caches
        if AI_CACHE_ROOT.exists():
            for subdir in AI_CACHE_ROOT.glob("*"):
                if subdir.is_dir():
                    for json_file in subdir.glob("*.json"):
                        if json_file.resolve() not in registered_caches:
                            orphan_caches.append(str(json_file))
                            
    finally:
        db.close()
        
    return {
        "stale_cache_refs": stale_cache_refs,
        "checksum_mismatches": checksum_mismatches,
        "orphan_caches": orphan_caches
    }

def run_reconciliation_audit() -> dict:
    datasets = reconcile_dataset_refs()
    reports = reconcile_report_refs()
    caches = reconcile_cache_refs()
    
    total_stale = (
        len(datasets["stale_dataset_refs"]) + 
        len(datasets["stale_version_refs"]) + 
        len(reports["stale_report_refs"]) + 
        len(caches["stale_cache_refs"])
    )
    total_orphan = (
        len(datasets["orphan_files"]) + 
        len(reports["orphan_reports"]) + 
        len(caches["orphan_caches"])
    )
    total_mismatch = (
        len(datasets["checksum_mismatches"]) + 
        len(reports["checksum_mismatches"]) + 
        len(caches["checksum_mismatches"])
    )
    
    return {
        "status": "success",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "summary": {
            "total_stale_references": total_stale,
            "total_orphan_artifacts": total_orphan,
            "total_checksum_mismatches": total_mismatch,
            "is_healthy": total_stale == 0 and total_orphan == 0 and total_mismatch == 0
        },
        "datasets": datasets,
        "reports": reports,
        "caches": caches
    }

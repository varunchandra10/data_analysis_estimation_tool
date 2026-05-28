from __future__ import annotations

import io
import json
from datetime import datetime
from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.lib import colors

from core.config import DEFAULT_PROJECT
from services.versioning.engine import read_dataset_file, get_manifest, compute_quality_score, ensure_dataset_layout, dataset_dir, processed_dir


def _ensure_report_dir(dataset_name: str) -> Path:
    folder = Path(dataset_dir(dataset_name))
    reports = folder / 'reports'
    reports.mkdir(parents=True, exist_ok=True)
    return reports


def _render_histogram(df, column: str, out_path: Path):
    plt.figure(figsize=(6, 3))
    df[column].dropna().hist(bins=30)
    plt.title(f'Distribution: {column}')
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()


def generate_report(
    version_name: str,
    project_id: str = DEFAULT_PROJECT,
    dataset_name: str | None = None,
    output_path: str | None = None,
    include_charts: bool = True,
    extra: dict[str, Any] | None = None,
) -> Path:
    manifest = get_manifest(project_id, version_name, dataset_name)
    resolved = dataset_name or manifest.get('dataset_name')
    df = read_dataset_file(manifest.get('dataset_path'))

    reports_dir = _ensure_report_dir(resolved)
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    report_name = output_path or str(reports_dir / f'report_{version_name}_{timestamp}.pdf')

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(report_name, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph(f'Dataset Report — {resolved} — {version_name}', styles['Title']))
    story.append(Spacer(1, 12))

    # Overview
    story.append(Paragraph('Dataset Overview', styles['Heading2']))
    overview = [
        ['Version', version_name],
        ['Dataset', resolved],
        ['Rows', str(int(df.shape[0]))],
        ['Columns', str(int(df.shape[1]))],
        ['Generated', datetime.utcnow().isoformat() + 'Z'],
    ]
    t = Table(overview, hAlign='LEFT')
    t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, colors.gray)]))
    story.append(t)
    story.append(Spacer(1, 12))

    # Summaries from manifest
    story.append(Paragraph('Preprocessing Summary', styles['Heading2']))
    ops = manifest.get('operations', [])
    story.append(Paragraph('Operations applied: ' + (', '.join(ops) if ops else 'None'), styles['Normal']))
    story.append(Spacer(1, 8))

    # Outlier / Validation / Weighting
    story.append(Paragraph('Outlier Summary', styles['Heading2']))
    outliers = manifest.get('outliers', {})
    story.append(Paragraph(json.dumps(outliers), styles['Code']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('Validation Summary', styles['Heading2']))
    validation = manifest.get('validation', {})
    story.append(Paragraph(json.dumps(validation), styles['Code']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('Weighting Summary', styles['Heading2']))
    weighting = manifest.get('weighting', {})
    story.append(Paragraph(json.dumps(weighting), styles['Code']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('AI Insights', styles['Heading2']))
    ai = manifest.get('ai_insights') or manifest.get('ai_explanation') or extra or {}
    story.append(Paragraph(json.dumps(ai), styles['Code']))
    story.append(Spacer(1, 12))

    # Data quality score
    try:
        quality = compute_quality_score(version_name, project_id, resolved)
        story.append(Paragraph('Data Quality Score', styles['Heading2']))
        story.append(Paragraph(f"Score: {quality.get('score')} — {quality.get('grade')}", styles['Normal']))
        story.append(Spacer(1, 8))
    except Exception:
        pass

    # Charts
    if include_charts and not df.select_dtypes(include='number').empty:
        numeric = df.select_dtypes(include='number').columns[:3]
        for col in numeric:
            img_path = reports_dir / f'chart_{version_name}_{col}.png'
            _render_histogram(df, col, img_path)
            story.append(Image(str(img_path), width=6 * inch, height=2.5 * inch))
            story.append(Spacer(1, 12))

    # Build PDF
    doc.build(story)

    return Path(report_name)
import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    ListFlowable,
    ListItem,
)


def build_pdf_report(report_payload: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="SectionTitle", fontSize=14, leading=18, spaceAfter=10, textColor=colors.HexColor("#0B3D91")))
    styles.add(ParagraphStyle(name="SmallBody", parent=styles["BodyText"], fontSize=10, leading=14, spaceAfter=6))
    styles.add(ParagraphStyle(name="TableHeader", parent=styles["Heading4"], alignment=TA_CENTER, textColor=colors.white, backColor=colors.HexColor("#0B3D91")))

    story = []
    story.append(Paragraph("DAET Professional Data Quality Report", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%SZ')}", styles["Normal"]))
    story.append(Spacer(1, 18))

    story.extend(_build_dataset_overview(report_payload, styles))
    story.append(PageBreak())
    story.extend(_build_cleaning_summary(report_payload, styles))
    story.append(PageBreak())
    story.extend(_build_outlier_analysis(report_payload, styles))
    story.append(PageBreak())
    story.extend(_build_validation_summary(report_payload, styles))
    story.append(PageBreak())
    story.extend(_build_weight_estimation(report_payload, styles))
    story.append(PageBreak())
    story.extend(_build_ai_interpretation(report_payload, styles))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def _safe(value, default="N/A"):
    if value is None or value == "":
        return default
    return value


def _safe_number(value, precision=2, default="N/A"):
    try:
        return f"{float(value):.{precision}f}"
    except Exception:
        return default


def _build_table(data, col_widths=None):
    table = Table(data, hAlign="LEFT", colWidths=col_widths)
    style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B3D91")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F4F7FB")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D9D9D9")),
    ])
    table.setStyle(style)
    return table


def _build_dataset_overview(report_payload, styles):
    dataset = report_payload.get("dataset", {})
    metadata = dataset.get("metadata", {})
    schema = dataset.get("schema", []) or []
    total_rows = metadata.get("rows", 0)
    total_columns = metadata.get("columns", len(schema))
    null_counts = dataset.get("nullCounts", {}) or {}
    total_null = sum(null_counts.values()) if isinstance(null_counts, dict) else 0
    missing_percent = _safe_number((total_null / (total_rows * total_columns) * 100) if total_rows and total_columns else None)

    heading = [Paragraph("1. Dataset Overview", styles["SectionTitle"])]
    rows = [
        ["Dataset Name", _safe(metadata.get("filename", metadata.get("datasetName", "Unknown Dataset")))],
        ["Total Rows", _safe(metadata.get("rows", total_rows))],
        ["Total Columns", _safe(metadata.get("columns", total_columns))],
        ["Missing Values", _safe(total_null)],
        ["Missing Percentage", f"{missing_percent}%"],
        ["Schema Columns", _safe(len(schema))],
    ]

    data = [["Property", "Value"]] + rows
    heading.append(_build_table(data, col_widths=[170, 290]))
    heading.append(Spacer(1, 12))

    schema_items = [f"{item.get('column')}: {item.get('type') or item.get('pandas_dtype', 'unknown')}" for item in schema[:10]]
    schema_content = schema_items if schema_items else ["Schema details not available."]
    heading.append(Paragraph("Schema sample:", styles["Normal"]))
    for line in schema_content:
        heading.append(Paragraph(line, styles["SmallBody"]))

    return heading


def _build_cleaning_summary(report_payload, styles):
    cleaning = report_payload.get("cleaning", {})
    ai_section = report_payload.get("ai", {})
    ai_recommendations = ai_section.get("recommendations", [])
    methods = set()

    for item in ai_recommendations:
        suggestions = item.get("suggestions", {})
        if suggestions.get("missing_value_method"):
            methods.add(suggestions["missing_value_method"])
        if suggestions.get("outlier_method"):
            methods.add(suggestions["outlier_method"])

    heading = [Paragraph("2. Cleaning Summary", styles["SectionTitle"])]
    rows = [
        ["Null analysis performed", _safe(cleaning.get("nullAnalysisAvailable", True))],
        ["Total columns with missing data", _safe(len(cleaning.get("nullCounts", {}) or {}))],
        ["Methods used", ", ".join(sorted(methods)) if methods else "Automatic review / backend recommendations"],
        ["Affected rows", _safe(cleaning.get("nullCounts", {}) and report_payload.get("dataset", {}).get("metadata", {}).get("rows", "N/A"))],
    ]
    data = [["Metric", "Summary"]] + rows
    heading.append(_build_table(data, col_widths=[170, 290]))
    heading.append(Spacer(1, 12))
    heading.append(Paragraph("Detailed cleaning actions are based on automated analysis and AI recommendations.", styles["SmallBody"]))
    return heading


def _build_outlier_analysis(report_payload, styles):
    outlier = report_payload.get("outliers", {})
    ai_section = report_payload.get("ai", {})
    distribution = outlier.get("distribution") or report_payload.get("statistics", {}).get("distribution")
    thresholds = _safe(outlier.get("thresholds") or outlier.get("method") or "Not available")
    total_outliers = _safe(outlier.get("total_outliers") or outlier.get("rowsAfter") or 0)

    heading = [Paragraph("3. Outlier Analysis", styles["SectionTitle"])]
    rows = [
        ["Thresholds", thresholds],
        ["Total outliers detected", total_outliers],
        ["Preview rows after outlier handling", _safe(outlier.get("rowsAfter", "N/A"))],
    ]
    data = [["Metric", "Value"]] + rows
    heading.append(_build_table(data, col_widths=[170, 290]))
    heading.append(Spacer(1, 12))

    if distribution:
        heading.append(Paragraph("Distribution summary:", styles["Normal"]))
        heading.append(Paragraph(str(distribution), styles["SmallBody"]))
    else:
        heading.append(Paragraph("Histogram / boxplot details are not available in the current payload.", styles["SmallBody"]))

    return heading


def _build_validation_summary(report_payload, styles):
    validation = report_payload.get("validation", {})
    severity_counts = validation.get("severity_counts") or {}
    failed_rules = _safe(validation.get("failedRules") or validation.get("violatedRows") or 0)

    heading = [Paragraph("4. Validation Summary", styles["SectionTitle"])]
    rows = [
        ["Validation executed", _safe(bool(validation.get("available", True)))],
        ["Total violated rows", failed_rules],
        ["Severity counts", ", ".join(f"{k}: {v}" for k, v in severity_counts.items()) or "Not provided"],
    ]
    data = [["Metric", "Outcome"]] + rows
    heading.append(_build_table(data, col_widths=[170, 290]))
    heading.append(Spacer(1, 12))
    heading.append(Paragraph("Validation insights highlight rules that require review to ensure data quality.", styles["SmallBody"]))
    return heading


def _build_weight_estimation(report_payload, styles):
    weighting = report_payload.get("weighting", {})
    weights = weighting.get("weights") or {}
    numeric_weights = [float(value) for value in weights.values() if _is_number(value)]
    weighted_mean = _safe_number(sum(numeric_weights) / len(numeric_weights)) if numeric_weights else "N/A"
    moe = _safe_number(weighting.get("moe"))
    confidence = _safe(weighting.get("confidence_interval") or weighting.get("confidenceInterval") or "N/A")

    heading = [Paragraph("5. Weight Estimation", styles["SectionTitle"])]
    rows = [
        ["Weighted mean", weighted_mean],
        ["Margin of error", moe],
        ["Confidence interval", confidence],
        ["Total weighted columns", _safe(len(numeric_weights))],
    ]
    data = [["Metric", "Result"]] + rows
    heading.append(_build_table(data, col_widths=[170, 290]))
    heading.append(Spacer(1, 12))
    heading.append(Paragraph("The weighting analysis estimates feature importance and confidence metrics.", styles["SmallBody"]))
    return heading


def _is_number(value):
    try:
        float(value)
        return True
    except Exception:
        return False


def _build_ai_interpretation(report_payload, styles):
    ai_section = report_payload.get("ai", {})
    recommendations = ai_section.get("recommendations", [])

    heading = [Paragraph("6. AI Interpretation", styles["SectionTitle"])]
    if not recommendations:
        heading.append(Paragraph("No AI recommendations available.", styles["SmallBody"]))
        return heading

    heading.append(Paragraph("AI-driven insights and short explanations:", styles["Normal"]))
    items = []
    for item in recommendations[:12]:
        column = item.get("column", "Unknown")
        recommendations_text = []
        if item.get("suggestions"):
            suggestions = item["suggestions"]
            for key, value in suggestions.items():
                if value is not None:
                    recommendations_text.append(f"{key.replace('_', ' ').capitalize()}: {value}")
        if item.get("statistics"):
            recommendations_text.append(f"Stats: {item['statistics']}")

        summary = "; ".join(recommendations_text)[:320] or "Review dataset quality for this column."
        items.append(ListItem(Paragraph(f"<b>{column}</b>: {summary}", styles["SmallBody"]), leftIndent=10))

    heading.append(ListFlowable(items, bulletType="bullet", start="disc"))
    return heading

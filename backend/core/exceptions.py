from __future__ import annotations


class DAETError(Exception):
    """Base exception for DAET domain failures."""


class DatasetNotFoundError(DAETError):
    pass


class ValidationRuleError(DAETError):
    pass


class PipelineExecutionError(DAETError):
    pass


class WeightingError(DAETError):
    pass


class AIEngineError(DAETError):
    pass


class ArchiveError(DAETError):
    pass

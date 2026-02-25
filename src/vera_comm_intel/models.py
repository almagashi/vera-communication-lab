from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class MarkerCounts:
    hedges: int = 0
    minimizers: int = 0
    apologies: int = 0
    permission_seeking: int = 0
    question_inflation: int = 0
    over_justification_segments: int = 0


@dataclass
class WrittenAnalysis:
    words: int
    sentences: int
    questions: int
    direct_statements: int
    marker_counts: MarkerCounts
    metric_values: Dict[str, float]
    firmness_score: float
    issues: List[Dict[str, str]] = field(default_factory=list)


@dataclass
class TranscriptTurnAnalysis:
    speaker: str
    text: str
    words: int
    marker_counts: MarkerCounts
    direct_statement_ratio: float


@dataclass
class TranscriptAnalysis:
    user: str
    turns: int
    speaking_time_pct: float
    interruption_count: int
    reclaim_attempt_count: int
    response_latency_avg_s: float
    marker_totals: MarkerCounts
    direct_statement_ratio: float
    firmness_index: float
    leverage_moments: List[str]

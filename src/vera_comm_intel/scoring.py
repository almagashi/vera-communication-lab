import re
from typing import Dict, List

from .models import MarkerCounts, WrittenAnalysis

HEDGES = [
    "maybe",
    "kind of",
    "sort of",
    "i think",
    "i guess",
    "perhaps",
]
MINIMIZERS = ["just", "a bit", "a little", "quick question"]
APOLOGIES = ["sorry to bother", "apologies but", "sorry, just", "sorry"]
PERMISSION_SEEKING = ["if that's okay", "would it be possible", "could we maybe"]
JUSTIFICATION_CUES = ["because", "since", "to provide context", "for background"]


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def _count_phrases(text: str, phrases: List[str]) -> int:
    total = 0
    for phrase in phrases:
        total += len(re.findall(rf"\b{re.escape(phrase)}\b", text))
    return total


def _split_sentences(text: str) -> List[str]:
    raw = re.split(r"(?<=[.!?])\s+", text.strip())
    return [s for s in raw if s]


def _direct_statement_ratio(sentences: List[str]) -> float:
    if not sentences:
        return 0.0
    direct = sum(1 for s in sentences if not s.strip().endswith("?"))
    return direct / len(sentences)


def _question_inflation(sentences: List[str]) -> int:
    return sum(1 for s in sentences if s.strip().endswith("?") and len(s.split()) > 8)


def _over_justification_segments(text: str) -> int:
    segments = 0
    for cue in JUSTIFICATION_CUES:
        segments += len(re.findall(rf"\b{re.escape(cue)}\b", text))
    return segments


def _rate_per_100(count: int, words: int) -> float:
    return (count / words) * 100 if words else 0.0


def _firmness_score(metrics: Dict[str, float], direct_ratio: float) -> float:
    score = 100.0
    score -= metrics["hedge_per_100"] * 3.0
    score -= metrics["minimizer_per_100"] * 2.5
    score -= metrics["apology_per_100"] * 4.0
    score -= metrics["permission_per_100"] * 3.5
    score -= metrics["question_ratio"] * 20.0
    score -= metrics["justification_ratio"] * 15.0
    score += direct_ratio * 10.0
    return max(0.0, min(100.0, round(score, 1)))


def analyze_written_text(text: str) -> WrittenAnalysis:
    normalized = _normalize(text)
    sentences = _split_sentences(text)
    words = len(re.findall(r"\b\w+\b", normalized))
    question_count = sum(1 for s in sentences if s.strip().endswith("?"))
    direct_count = len(sentences) - question_count

    marker_counts = MarkerCounts(
        hedges=_count_phrases(normalized, HEDGES),
        minimizers=_count_phrases(normalized, MINIMIZERS),
        apologies=_count_phrases(normalized, APOLOGIES),
        permission_seeking=_count_phrases(normalized, PERMISSION_SEEKING),
        question_inflation=_question_inflation(sentences),
        over_justification_segments=_over_justification_segments(normalized),
    )

    metrics = {
        "hedge_per_100": _rate_per_100(marker_counts.hedges, words),
        "minimizer_per_100": _rate_per_100(marker_counts.minimizers, words),
        "apology_per_100": _rate_per_100(marker_counts.apologies, words),
        "permission_per_100": _rate_per_100(marker_counts.permission_seeking, words),
        "question_ratio": (question_count / len(sentences)) if sentences else 0.0,
        "justification_ratio": (marker_counts.over_justification_segments / len(sentences)) if sentences else 0.0,
    }

    direct_ratio = _direct_statement_ratio(sentences)
    score = _firmness_score(metrics, direct_ratio)

    issues = []
    if marker_counts.hedges:
        issues.append(
            {
                "issue": "Hedge language detected",
                "why": "Hedges lower certainty signaling and can reduce perceived authority.",
                "example_fix": "Replace 'I think we should' with 'We should'.",
            }
        )
    if marker_counts.apologies:
        issues.append(
            {
                "issue": "Apology opener detected",
                "why": "Habitual apology openings can imply lower status before the ask.",
                "example_fix": "Start with the request directly and reserve apologies for true faults.",
            }
        )

    return WrittenAnalysis(
        words=words,
        sentences=len(sentences),
        questions=question_count,
        direct_statements=direct_count,
        marker_counts=marker_counts,
        metric_values=metrics,
        firmness_score=score,
        issues=issues,
    )

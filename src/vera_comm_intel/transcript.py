import re
from typing import List, Tuple

from .models import MarkerCounts, TranscriptAnalysis, TranscriptTurnAnalysis
from .scoring import analyze_written_text


def _parse_transcript(transcript: str) -> List[Tuple[str, str]]:
    turns: List[Tuple[str, str]] = []
    for line in transcript.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        speaker, text = line.split(":", 1)
        turns.append((speaker.strip(), text.strip()))
    return turns


def _estimate_latency_seconds(current_text: str) -> float:
    words = len(re.findall(r"\b\w+\b", current_text))
    return max(0.5, words / 2.5)


def analyze_transcript(transcript: str, user: str) -> TranscriptAnalysis:
    turns = _parse_transcript(transcript)
    user_turns = [t for t in turns if t[0].lower() == user.lower()]

    turn_analyses: List[TranscriptTurnAnalysis] = []
    interruptions = 0
    reclaim_attempts = 0
    user_words = 0
    total_words = 0
    latency_samples = []

    marker_totals = MarkerCounts()

    for idx, (speaker, text) in enumerate(turns):
        analysis = analyze_written_text(text)
        words = analysis.words
        total_words += words
        if speaker.lower() == user.lower():
            user_words += words
            marker_totals.hedges += analysis.marker_counts.hedges
            marker_totals.minimizers += analysis.marker_counts.minimizers
            marker_totals.apologies += analysis.marker_counts.apologies
            marker_totals.permission_seeking += analysis.marker_counts.permission_seeking
            marker_totals.question_inflation += analysis.marker_counts.question_inflation
            marker_totals.over_justification_segments += analysis.marker_counts.over_justification_segments
            if idx > 0 and turns[idx - 1][0].lower() != user.lower():
                latency_samples.append(_estimate_latency_seconds(text))

            if re.search(r"\b(as i was saying|to finish my point|let me complete)\b", text.lower()):
                reclaim_attempts += 1

        if "--" in text or "[interrupt" in text.lower():
            interruptions += 1

        turn_analyses.append(
            TranscriptTurnAnalysis(
                speaker=speaker,
                text=text,
                words=words,
                marker_counts=analysis.marker_counts,
                direct_statement_ratio=(analysis.direct_statements / analysis.sentences) if analysis.sentences else 0.0,
            )
        )

    speaking_time_pct = (user_words / total_words * 100) if total_words else 0.0

    direct_statement_ratio = 0.0
    if user_turns:
        direct_sentences = 0
        total_sentences = 0
        for speaker, text in user_turns:
            a = analyze_written_text(text)
            direct_sentences += a.direct_statements
            total_sentences += a.sentences
        direct_statement_ratio = (direct_sentences / total_sentences) if total_sentences else 0.0

    synthetic_text = " ".join(text for speaker, text in user_turns)
    firmness_index = analyze_written_text(synthetic_text).firmness_score if synthetic_text else 0.0

    leverage_moments = []
    if marker_totals.apologies:
        leverage_moments.append("Replace apology-led openings with direct framing in key asks.")
    if reclaim_attempts == 0 and interruptions > 0:
        leverage_moments.append("Use explicit reclaim language after interruptions to preserve frame control.")
    if direct_statement_ratio < 0.6:
        leverage_moments.append("Increase declarative statements during decisions and ownership moments.")

    return TranscriptAnalysis(
        user=user,
        turns=len(turns),
        speaking_time_pct=round(speaking_time_pct, 1),
        interruption_count=interruptions,
        reclaim_attempt_count=reclaim_attempts,
        response_latency_avg_s=round(sum(latency_samples) / len(latency_samples), 2) if latency_samples else 0.0,
        marker_totals=marker_totals,
        direct_statement_ratio=round(direct_statement_ratio, 2),
        firmness_index=firmness_index,
        leverage_moments=leverage_moments,
    )

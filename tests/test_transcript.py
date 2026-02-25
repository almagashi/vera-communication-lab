from vera_comm_intel.transcript import analyze_transcript


def test_transcript_analysis_core_metrics():
    transcript = """
    Alex: Sorry, just a quick question -- could we maybe push the release?
    Jordan: No, we should keep the date.
    Alex: As I was saying, QA still has two blockers.
    """
    report = analyze_transcript(transcript, user="Alex")

    assert report.turns == 3
    assert report.interruption_count >= 1
    assert report.reclaim_attempt_count >= 1
    assert report.marker_totals.apologies >= 1
    assert 0 <= report.firmness_index <= 100

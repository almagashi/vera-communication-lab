from vera_comm_intel.scoring import analyze_written_text


def test_firmness_score_penalizes_softeners():
    soft = analyze_written_text("Sorry, just a quick question: I think maybe we could maybe delay this?")
    firm = analyze_written_text("We will delay this until QA is complete.")
    assert soft.firmness_score < firm.firmness_score
    assert soft.marker_counts.hedges >= 1
    assert soft.marker_counts.apologies >= 1


def test_direct_statement_ratio_detected():
    analysis = analyze_written_text("Can we do this? We should do this.")
    assert analysis.sentences == 2
    assert analysis.questions == 1
    assert analysis.direct_statements == 1

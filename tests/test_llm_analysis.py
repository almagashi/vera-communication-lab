import json

import pytest

from vera_comm_intel.llm_analysis import LLMConfigurationError, _extract_json, analyze_written_with_llm


def test_extract_json_handles_plain_json():
    payload = '{"firmness_score": 77, "issues": [], "summary": "ok", "rewrite": "hello"}'
    parsed = _extract_json(payload)
    assert parsed["firmness_score"] == 77


def test_analyze_written_llm_requires_api_key(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    with pytest.raises(LLMConfigurationError):
        analyze_written_with_llm("hello")

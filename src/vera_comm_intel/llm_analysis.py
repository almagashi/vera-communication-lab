import json
import os
from typing import Any, Dict, List

import httpx


SYSTEM_PROMPT = """
You are Vera, a communication intelligence analyzer.
Analyze professional written communication for authority and clarity signals.
Return ONLY valid JSON with this exact schema:
{
  "firmness_score": number (0-100),
  "issues": [
    {
      "label": string,
      "severity": "low"|"medium"|"high",
      "snippet": string,
      "why": string,
      "suggestion": string
    }
  ],
  "summary": string,
  "rewrite": string
}
Do not include markdown fences.
""".strip()


class LLMConfigurationError(RuntimeError):
    pass


def _extract_json(content: str) -> Dict[str, Any]:
    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
    return json.loads(cleaned)


def analyze_written_with_llm(text: str) -> Dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("VERA_LLM_MODEL", "gpt-4o-mini")

    if not api_key:
        raise LLMConfigurationError("OPENAI_API_KEY is not set.")

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this text:\n\n{text}"},
        ],
        "temperature": 0.2,
    }

    with httpx.Client(timeout=30) as client:
        response = client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()

    data = response.json()
    content = data["choices"][0]["message"]["content"]
    parsed = _extract_json(content)

    # basic schema hardening
    parsed.setdefault("firmness_score", 0)
    parsed.setdefault("issues", [])
    parsed.setdefault("summary", "")
    parsed.setdefault("rewrite", text)
    if not isinstance(parsed["issues"], list):
        parsed["issues"] = []

    normalized_issues: List[Dict[str, str]] = []
    for issue in parsed["issues"]:
        if not isinstance(issue, dict):
            continue
        normalized_issues.append(
            {
                "label": str(issue.get("label", "Issue")),
                "severity": str(issue.get("severity", "medium")),
                "snippet": str(issue.get("snippet", "")),
                "why": str(issue.get("why", "")),
                "suggestion": str(issue.get("suggestion", "")),
            }
        )
    parsed["issues"] = normalized_issues
    parsed["firmness_score"] = float(parsed.get("firmness_score", 0))
    return parsed

# Vera – Communication Intelligence

Vera is a structured communication intelligence engine focused on authority signals and conversational power dynamics.

## What is included in this repository

This implementation now includes:

- **Rule-based scoring engine** for written and transcript analysis
- **FastAPI backend** exposing analyzer APIs
- **Minimal web app** for running Written Analyzer and Transcript Lab in the browser
- **Chrome extension MVP** for on-page draft analysis and quick firmer rewrites

## Run the web app locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app:app --reload
```

Open `http://127.0.0.1:8000`.

## Install and run the browser extension (Chrome)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this repo's `extension/` directory
5. Open Gmail/Docs/Slack Web (or any page with editable text)
6. Click the Vera extension icon and run:
   - **Analyze Current Draft**
   - **Apply Firmer Rewrite**

## API Endpoints

- `POST /api/analyze/written`
  - body: `{ "text": "..." }`
- `POST /api/analyze/transcript`
  - body: `{ "transcript": "Speaker: text", "user": "Speaker" }`

## Python Usage

```python
from vera_comm_intel import analyze_written_text, analyze_transcript

written = analyze_written_text("Sorry to bother, I think maybe we could revisit this?")
print(written.firmness_score)

transcript = """
Alex: Sorry, just a quick question -- should we maybe delay launch?
Jordan: We should decide now.
Alex: As I was saying, the risk is in QA.
"""
report = analyze_transcript(transcript, user="Alex")
print(report.firmness_index)
```

## Run tests

```bash
python -m pytest
```

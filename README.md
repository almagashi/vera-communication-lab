# Vera – Communication Intelligence

Vera is a structured communication intelligence engine focused on authority signals and conversational power dynamics.

## What is included in this repository

This implementation includes:

- **Rule-based backend scoring engine** (for baseline + transcript analysis)
- **LLM analysis API** for written communication insights
- **FastAPI backend** and minimal web app
- **Chrome extension MVP** with automatic in-field analysis dot + click-for-details panel

## Run the backend locally (required for extension LLM analysis)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
export OPENAI_API_KEY="your_openai_api_key"
python -m uvicorn app:app --reload
```

Open `http://127.0.0.1:8000`.

## Install and run the browser extension (Chrome)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this repo's `extension/` directory
5. Open a normal webpage with an editable field (Gmail/Docs/Slack web, etc.)
6. Refresh that tab once after installing/reloading extension
7. Click inside a text field and type; Vera auto-analyzes and shows a blue dot
8. Click the dot to open details and apply rewrite

If popup shows connection errors, make sure:
- You are not on `chrome://` pages
- Backend is running at `http://127.0.0.1:8000`
- `OPENAI_API_KEY` is set before launching backend

## API Endpoints

- `POST /api/analyze/written` (rule-based)
- `POST /api/analyze/written-llm` (LLM-based)
- `POST /api/analyze/transcript`

## Run tests

```bash
python -m pytest
```

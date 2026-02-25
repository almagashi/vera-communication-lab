from dataclasses import asdict
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from fastapi.middleware.cors import CORSMiddleware

from vera_comm_intel.llm_analysis import LLMConfigurationError, analyze_written_with_llm
from vera_comm_intel import analyze_transcript, analyze_written_text

app = FastAPI(title="Vera Communication Intelligence", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WEB_DIR = Path(__file__).parent / "web"
app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")


class WrittenRequest(BaseModel):
    text: str = Field(min_length=1)


class TranscriptRequest(BaseModel):
    transcript: str = Field(min_length=1)
    user: str = Field(min_length=1)


@app.get("/")
def index() -> FileResponse:
    return FileResponse(WEB_DIR / "index.html")


@app.post("/api/analyze/written")
def analyze_written(payload: WrittenRequest) -> dict:
    analysis = analyze_written_text(payload.text)
    return asdict(analysis)


@app.post("/api/analyze/transcript")
def analyze_meeting(payload: TranscriptRequest) -> dict:
    analysis = analyze_transcript(payload.transcript, payload.user)
    return asdict(analysis)


@app.post("/api/analyze/written-llm")
def analyze_written_llm(payload: WrittenRequest) -> dict:
    try:
        return analyze_written_with_llm(payload.text)
    except LLMConfigurationError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM request failed: {exc}") from exc

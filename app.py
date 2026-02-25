from dataclasses import asdict
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from vera_comm_intel import analyze_transcript, analyze_written_text

app = FastAPI(title="Vera Communication Intelligence", version="0.2.0")

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

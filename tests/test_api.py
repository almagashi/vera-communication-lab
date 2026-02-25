from fastapi.testclient import TestClient

from app import app


client = TestClient(app)


def test_written_endpoint_returns_score():
    response = client.post(
        "/api/analyze/written",
        json={"text": "Sorry, just a quick question: could we maybe delay this?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "firmness_score" in data
    assert "marker_counts" in data


def test_transcript_endpoint_returns_report():
    response = client.post(
        "/api/analyze/transcript",
        json={
            "user": "Alex",
            "transcript": "Alex: Sorry, just a quick question -- could we maybe push release?\nJordan: Keep date.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"] == "Alex"
    assert "speaking_time_pct" in data

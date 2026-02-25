const writtenText = document.getElementById("writtenText");
const transcriptText = document.getElementById("transcriptText");
const speaker = document.getElementById("speaker");
const writtenResult = document.getElementById("writtenResult");
const transcriptResult = document.getElementById("transcriptResult");

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

document.getElementById("analyzeWritten").addEventListener("click", async () => {
  writtenResult.textContent = "Analyzing...";
  try {
    const data = await postJson("/api/analyze/written", { text: writtenText.value });
    writtenResult.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    writtenResult.textContent = `Error: ${error.message}`;
  }
});

document.getElementById("analyzeTranscript").addEventListener("click", async () => {
  transcriptResult.textContent = "Analyzing...";
  try {
    const data = await postJson("/api/analyze/transcript", {
      transcript: transcriptText.value,
      user: speaker.value,
    });
    transcriptResult.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    transcriptResult.textContent = `Error: ${error.message}`;
  }
});

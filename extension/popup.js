const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const issuesEl = document.getElementById("issues");
const apiBaseInput = document.getElementById("apiBase");

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function renderAnalysis(analysis) {
  scoreEl.innerHTML = `
    <strong>Firmness Score: ${(analysis.firmness_score ?? 0).toFixed ? analysis.firmness_score.toFixed(1) : analysis.firmness_score ?? 0}</strong><br />
    ${analysis.summary || ""}
  `;

  if (!analysis.issues?.length) {
    issuesEl.innerHTML = "No issues detected or waiting for analysis.";
    return;
  }

  issuesEl.innerHTML = analysis.issues
    .map(
      (issue) => `
        <article class="issue">
          <strong>${issue.label || "Issue"}</strong>
          <div>${issue.why || ""}</div>
          <em>${issue.suggestion || ""}</em>
        </article>
      `
    )
    .join("");
}

async function sendToTab(message) {
  const tab = await getActiveTab();
  return chrome.tabs.sendMessage(tab.id, message);
}

async function loadSettings() {
  chrome.storage.sync.get(["veraApiBase"], (res) => {
    apiBaseInput.value = res.veraApiBase || "http://127.0.0.1:8000";
  });
}

loadSettings();

document.getElementById("saveBtn").addEventListener("click", async () => {
  const value = apiBaseInput.value.trim() || "http://127.0.0.1:8000";
  chrome.storage.sync.set({ veraApiBase: value }, async () => {
    statusEl.textContent = `Saved API URL: ${value}`;
    try {
      await sendToTab({ type: "set_api_base", apiBase: value });
    } catch (_err) {
      // ignore; tab may not have content script (internal chrome pages)
    }
  });
});

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  statusEl.textContent = "Analyzing...";
  try {
    const response = await sendToTab({ type: "analyze_page" });
    if (!response?.ok) {
      statusEl.textContent = response?.error || "Unable to analyze this page.";
      return;
    }
    statusEl.textContent = "Analysis complete.";
    renderAnalysis(response.analysis || {});
  } catch (error) {
    statusEl.textContent =
      "Connection failed. Open a regular webpage (not chrome://), refresh it, click in a text field, and try again.";
  }
});

document.getElementById("rewriteBtn").addEventListener("click", async () => {
  statusEl.textContent = "Applying rewrite...";
  try {
    const response = await sendToTab({ type: "apply_rewrite" });
    statusEl.textContent = response?.ok
      ? "Firmer rewrite applied to active draft."
      : response?.error || "Rewrite failed.";
  } catch (_error) {
    statusEl.textContent =
      "Connection failed. Open a normal webpage with a focused text field and try again.";
  }
});

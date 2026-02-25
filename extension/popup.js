const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const issuesEl = document.getElementById("issues");

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function renderAnalysis(analysis) {
  scoreEl.innerHTML = `
    <strong>Firmness Score: ${analysis.firmnessScore}</strong><br />
    Words: ${analysis.words} · Questions: ${analysis.questions} · Direct statements: ${analysis.directStatements}<br />
    Hedges: ${analysis.markerCounts.hedges} · Minimizers: ${analysis.markerCounts.minimizers} · Apologies: ${analysis.markerCounts.apologies}
  `;

  if (!analysis.issues.length) {
    issuesEl.innerHTML = "No authority-softening issues detected in this sample.";
    return;
  }

  issuesEl.innerHTML = analysis.issues
    .map(
      (issue) => `
        <article class="issue">
          <strong>${issue.issue}</strong>
          <div>${issue.why}</div>
          <em>${issue.fix}</em>
        </article>
      `
    )
    .join("");
}

async function sendToTab(message) {
  const tab = await getActiveTab();
  return chrome.tabs.sendMessage(tab.id, message);
}

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  statusEl.textContent = "Analyzing...";
  try {
    const response = await sendToTab({ type: "analyze_page" });
    if (!response?.ok) {
      statusEl.textContent = response?.error || "Unable to analyze this page.";
      return;
    }
    statusEl.textContent = "Analysis complete.";
    renderAnalysis(response.analysis);
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
  }
});

document.getElementById("rewriteBtn").addEventListener("click", async () => {
  statusEl.textContent = "Applying rewrite...";
  try {
    const response = await sendToTab({ type: "apply_rewrite" });
    statusEl.textContent = response?.ok
      ? "Firmer rewrite applied to active draft."
      : response?.error || "Rewrite failed.";
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
  }
});

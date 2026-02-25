(() => {
  const DEFAULT_API_BASE = "http://127.0.0.1:8000";

  let activeEditable = null;
  let indicator = null;
  let panel = null;
  let latestAnalysis = null;
  let analyzeTimer = null;
  let currentApiBase = DEFAULT_API_BASE;

  function isEditable(el) {
    return (
      el &&
      (el.tagName === "TEXTAREA" ||
        (el.tagName === "INPUT" && (el.type === "text" || el.type === "search")) ||
        el.isContentEditable)
    );
  }

  function getEditableText(el) {
    if (!el) return "";
    return el.isContentEditable ? el.innerText || "" : el.value || "";
  }

  function setEditableText(el, text) {
    if (!el) return;
    if (el.isContentEditable) {
      el.innerText = text;
    } else {
      el.value = text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function ensureIndicator() {
    if (indicator) return indicator;
    indicator = document.createElement("button");
    indicator.type = "button";
    indicator.title = "Vera insights";
    indicator.textContent = "●";
    Object.assign(indicator.style, {
      position: "absolute",
      zIndex: 2147483646,
      border: "none",
      borderRadius: "999px",
      width: "18px",
      height: "18px",
      lineHeight: "18px",
      padding: "0",
      background: "#0284c7",
      color: "#e0f2fe",
      fontSize: "14px",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(2,132,199,0.45)",
      display: "none",
    });
    indicator.addEventListener("click", () => {
      if (!activeEditable) return;
      togglePanel();
    });
    document.body.appendChild(indicator);
    return indicator;
  }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement("div");
    Object.assign(panel.style, {
      position: "absolute",
      zIndex: 2147483646,
      width: "340px",
      maxHeight: "420px",
      overflowY: "auto",
      background: "#0b1220",
      border: "1px solid #1e293b",
      borderRadius: "10px",
      padding: "10px",
      color: "#e2e8f0",
      fontFamily: "Inter,system-ui,sans-serif",
      fontSize: "12px",
      display: "none",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    });
    document.body.appendChild(panel);
    return panel;
  }

  function positionUi() {
    if (!activeEditable || !isEditable(activeEditable)) return;
    const rect = activeEditable.getBoundingClientRect();
    const dot = ensureIndicator();
    dot.style.display = "block";
    dot.style.top = `${window.scrollY + rect.top + 6}px`;
    dot.style.left = `${window.scrollX + rect.right - 24}px`;

    if (panel && panel.style.display === "block") {
      panel.style.top = `${window.scrollY + rect.top + 28}px`;
      panel.style.left = `${window.scrollX + rect.right - 350}px`;
    }
  }

  function severityColor(severity) {
    if (severity === "high") return "#ef4444";
    if (severity === "medium") return "#f59e0b";
    return "#22c55e";
  }

  function renderPanel() {
    const p = ensurePanel();
    if (!latestAnalysis) {
      p.innerHTML = `<div>Analyzing...</div>`;
      return;
    }
    const issues = latestAnalysis.issues || [];
    const issuesHtml = issues.length
      ? issues
          .map(
            (issue) => `
            <div style="margin-top:8px;padding-top:8px;border-top:1px dashed #334155;">
              <div style="display:flex;justify-content:space-between;gap:8px;">
                <strong>${issue.label || "Issue"}</strong>
                <span style="color:${severityColor(issue.severity)}">${issue.severity || "medium"}</span>
              </div>
              ${issue.snippet ? `<div style="color:#93c5fd;margin:4px 0;">“${issue.snippet}”</div>` : ""}
              <div>${issue.why || ""}</div>
              <div style="margin-top:4px;color:#86efac;"><em>${issue.suggestion || ""}</em></div>
            </div>
          `
          )
          .join("")
      : "<div>No issues detected.</div>";

    p.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>Vera Insight</strong>
        <button id="vera-close" style="background:none;border:none;color:#94a3b8;cursor:pointer;">✕</button>
      </div>
      <div style="margin-top:8px;"><strong>Firmness:</strong> ${Number(latestAnalysis.firmness_score || 0).toFixed(1)}/100</div>
      <div style="margin-top:4px;color:#cbd5e1;">${latestAnalysis.summary || ""}</div>
      <div style="margin-top:8px;color:#bae6fd;"><strong>Suggested rewrite</strong><br/>${latestAnalysis.rewrite || ""}</div>
      ${issuesHtml}
      <button id="vera-apply" style="margin-top:10px;width:100%;background:#0c4a6e;color:#fff;border:1px solid #0369a1;padding:8px;border-radius:8px;cursor:pointer;">Apply rewrite</button>
    `;

    p.querySelector("#vera-close")?.addEventListener("click", () => {
      p.style.display = "none";
    });

    p.querySelector("#vera-apply")?.addEventListener("click", () => {
      if (activeEditable && latestAnalysis?.rewrite) {
        setEditableText(activeEditable, latestAnalysis.rewrite);
      }
    });
  }

  function togglePanel() {
    const p = ensurePanel();
    p.style.display = p.style.display === "block" ? "none" : "block";
    renderPanel();
    positionUi();
  }

  async function getApiBase() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["veraApiBase"], (res) => {
        resolve(res.veraApiBase || DEFAULT_API_BASE);
      });
    });
  }

  async function analyzeActive() {
    if (!activeEditable) return;
    const text = getEditableText(activeEditable).trim();
    if (!text || text.length < 8) {
      latestAnalysis = null;
      return;
    }

    currentApiBase = await getApiBase();
    try {
      const response = await fetch(`${currentApiBase}/api/analyze/written-llm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const detail = await response.text();
        latestAnalysis = {
          firmness_score: 0,
          summary: `Vera API error (${response.status}). ${detail}`,
          rewrite: text,
          issues: [],
        };
      } else {
        latestAnalysis = await response.json();
      }
    } catch (error) {
      latestAnalysis = {
        firmness_score: 0,
        summary: `Could not reach Vera API at ${currentApiBase}. Start backend and check CORS/settings.`,
        rewrite: text,
        issues: [],
      };
    }

    renderPanel();
    positionUi();
  }

  function scheduleAnalyze() {
    clearTimeout(analyzeTimer);
    analyzeTimer = setTimeout(analyzeActive, 700);
  }

  document.addEventListener("focusin", (event) => {
    if (isEditable(event.target)) {
      activeEditable = event.target;
      positionUi();
      scheduleAnalyze();
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target === activeEditable) {
      positionUi();
      scheduleAnalyze();
    }
  });

  window.addEventListener("scroll", positionUi, true);
  window.addEventListener("resize", positionUi);

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "analyze_page") {
      if (!activeEditable) {
        sendResponse({ ok: false, error: "Click inside a text field first." });
        return;
      }
      analyzeActive().then(() => {
        sendResponse({ ok: true, analysis: latestAnalysis || {} });
      });
      return true;
    }

    if (message.type === "apply_rewrite") {
      if (!activeEditable || !latestAnalysis?.rewrite) {
        sendResponse({ ok: false, error: "No rewrite available yet." });
        return;
      }
      setEditableText(activeEditable, latestAnalysis.rewrite);
      sendResponse({ ok: true, rewritten: latestAnalysis.rewrite });
    }

    if (message.type === "set_api_base") {
      currentApiBase = message.apiBase || DEFAULT_API_BASE;
      sendResponse({ ok: true });
    }
  });
})();

(() => {
  let activeEditable = null;

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

  function collectCandidates() {
    const fields = Array.from(
      document.querySelectorAll('textarea, input[type="text"], input[type="search"], [contenteditable="true"]')
    )
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({
        element: el,
        text: getEditableText(el),
        length: getEditableText(el).trim().length
      }))
      .filter((c) => c.length > 0);

    return fields.sort((a, b) => b.length - a.length);
  }

  document.addEventListener("focusin", (event) => {
    if (isEditable(event.target)) {
      activeEditable = event.target;
    }
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!window.veraRules) {
      sendResponse({ ok: false, error: "Vera rules not loaded." });
      return;
    }

    if (message.type === "analyze_page") {
      const candidates = collectCandidates();
      const target = isEditable(activeEditable)
        ? { element: activeEditable, text: getEditableText(activeEditable) }
        : candidates[0] || { element: null, text: "" };

      if (!target.text.trim()) {
        sendResponse({ ok: false, error: "No editable text found on this page." });
        return;
      }

      const analysis = window.veraRules.analyzeText(target.text);
      sendResponse({
        ok: true,
        analysis,
        sample: target.text.slice(0, 500)
      });
      return;
    }

    if (message.type === "apply_rewrite") {
      const candidates = collectCandidates();
      const target = isEditable(activeEditable)
        ? activeEditable
        : candidates[0]?.element;

      if (!target) {
        sendResponse({ ok: false, error: "No editable target found." });
        return;
      }

      const original = getEditableText(target);
      const rewritten = window.veraRules.suggestRewrite(original);
      setEditableText(target, rewritten);
      sendResponse({ ok: true, rewritten });
    }
  });
})();

(() => {
  const HEDGES = ["maybe", "kind of", "sort of", "i think", "i guess", "perhaps"];
  const MINIMIZERS = ["just", "a bit", "a little", "quick question"];
  const APOLOGIES = ["sorry to bother", "apologies but", "sorry, just", "sorry"];
  const PERMISSION_SEEKING = ["if that's okay", "would it be possible", "could we maybe"];
  const JUSTIFICATION_CUES = ["because", "since", "to provide context", "for background"];

  function normalize(text) {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
  }

  function countPhrases(text, phrases) {
    return phrases.reduce((sum, phrase) => {
      const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
      return sum + (text.match(re) || []).length;
    }, 0);
  }

  function splitSentences(text) {
    return text.split(/(?<=[.!?])\s+/).filter(Boolean);
  }

  function questionInflation(sentences) {
    return sentences.filter((s) => s.trim().endsWith("?") && s.trim().split(/\s+/).length > 8).length;
  }

  function overJustification(text) {
    return countPhrases(text, JUSTIFICATION_CUES);
  }

  function ratePer100(count, words) {
    return words ? (count / words) * 100 : 0;
  }

  function directRatio(sentences) {
    if (!sentences.length) return 0;
    const direct = sentences.filter((s) => !s.trim().endsWith("?")).length;
    return direct / sentences.length;
  }

  function computeFirmness(metrics, direct) {
    let score = 100;
    score -= metrics.hedgePer100 * 3;
    score -= metrics.minimizerPer100 * 2.5;
    score -= metrics.apologyPer100 * 4;
    score -= metrics.permissionPer100 * 3.5;
    score -= metrics.questionRatio * 20;
    score -= metrics.justificationRatio * 15;
    score += direct * 10;
    return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
  }

  function buildIssues(markers) {
    const issues = [];
    if (markers.hedges > 0) {
      issues.push({
        issue: "Hedge language detected",
        why: "Hedges can reduce certainty signaling.",
        fix: "Turn 'I think we should' into 'We should'."
      });
    }
    if (markers.apologies > 0) {
      issues.push({
        issue: "Apology opener detected",
        why: "Habitual apologies can lower authority framing.",
        fix: "Lead with the ask; apologize only for real faults."
      });
    }
    if (markers.permission > 0) {
      issues.push({
        issue: "Permission-seeking language detected",
        why: "Permission framing can dilute decision ownership.",
        fix: "Use direct ownership language (e.g., 'Let's')."
      });
    }
    return issues;
  }

  function analyzeText(text) {
    const normalized = normalize(text);
    const sentences = splitSentences(text);
    const words = (normalized.match(/\b\w+\b/g) || []).length;
    const questions = sentences.filter((s) => s.trim().endsWith("?")).length;
    const markers = {
      hedges: countPhrases(normalized, HEDGES),
      minimizers: countPhrases(normalized, MINIMIZERS),
      apologies: countPhrases(normalized, APOLOGIES),
      permission: countPhrases(normalized, PERMISSION_SEEKING),
      questionInflation: questionInflation(sentences),
      overJustification: overJustification(normalized)
    };

    const metrics = {
      hedgePer100: ratePer100(markers.hedges, words),
      minimizerPer100: ratePer100(markers.minimizers, words),
      apologyPer100: ratePer100(markers.apologies, words),
      permissionPer100: ratePer100(markers.permission, words),
      questionRatio: sentences.length ? questions / sentences.length : 0,
      justificationRatio: sentences.length ? markers.overJustification / sentences.length : 0
    };

    const direct = directRatio(sentences);
    return {
      words,
      sentences: sentences.length,
      questions,
      directStatements: Math.max(0, sentences.length - questions),
      markerCounts: markers,
      metricValues: metrics,
      firmnessScore: computeFirmness(metrics, direct),
      issues: buildIssues(markers)
    };
  }

  function suggestRewrite(text) {
    return text
      .replace(/\b[Ii]\s+think\s+/g, "")
      .replace(/\b[Ii]\s+guess\s+/g, "")
      .replace(/\b[Ss]orry,?\s*/g, "")
      .replace(/\bjust\b\s*/g, "")
      .replace(/\bcould we maybe\b/gi, "let's")
      .replace(/\bwould it be possible to\b/gi, "please")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  window.veraRules = { analyzeText, suggestRewrite };
})();

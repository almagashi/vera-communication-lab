# Product Requirements Document
## Product Name (Working): Vera – Communication Intelligence

## 1. Executive Summary
Vera is a Communication Intelligence system that helps professionals improve firmness, clarity, and authority in both written and spoken communication.

V1 consists of two core components:
- Written Communication Overlay
- Post-Meeting Transcript Analyzer

Vera is **not** a general rewrite assistant, grammar checker, filler-word counter, or ideology product. It is a **structured, defensible communication intelligence engine** centered on authority signals and conversational power dynamics.

## 2. Motivation & Problem Statement
### 2.1 Core Problem
Professionals often over-soften, hedge, over-apologize, over-justify, avoid boundaries, and fail to reclaim interruptions. This can reduce perceived authority, negotiation leverage, and advancement velocity.

### 2.2 Why This Matters Now
Communication remains high-leverage and durable in an AI-heavy world. Existing writing and speaking tools focus on grammar, style, pace, or generic rewrites; they rarely optimize for calibrated authority.

### 2.3 Market Gap
Vera differentiates with:
- Structured authority signal detection
- Boundary clarity metrics
- Conversation dynamic analysis
- Post-meeting power replay
- Explicit firmness scoring

## 3. Product Vision
Vera is a Communication Intelligence Layer that detects self-diminishing language, measures authority signals, analyzes dynamics, embeds micro-education, and tracks behavior patterns over time.

## 4. Core Design Principles
- Calm, modern, scientific UI
- Opinionated but defensible
- Explainable, structured metrics
- LLMs assist suggestions, not scoring
- Embedded education in micro-doses
- Low-friction intervention in high-leverage moments

## 5. V1 Feature Set – Written Communication Overlay
### 5.1 Purpose
Real-time detection of self-diminishing language in Gmail/Docs (Slack optional).

### 5.2 Detection Markers
1. Hedge density
2. Minimizers
3. Apology openings
4. Permission-seeking language
5. Question inflation
6. Over-justification

### 5.3 Scoring Framework
Firmness Score (0–100), weighted by explicit, documented components:
- Hedge frequency per 100 words
- Minimizer frequency
- Apology frequency
- Direct statement ratio
- Question-to-statement ratio
- Justification length ratio

LLM usage:
- Suggest alternatives
- Context-sensitive rewrites
- 30-second insight explanations

LLM does not define scoring logic.

### 5.4 Interaction
Soft highlight in-line → click panel with issue, rationale, firmer alternative, and optional “Read More (30 sec)” micro-lesson.

### 5.5 Weekly Snapshot
Minimal metrics:
- Softener trend
- Directness improvement
- Apology reduction
- Boundary clarity indicator

## 6. Transcript Analyzer (Lab Mode)
### 6.1 Purpose
Analyze real-world spoken communication with structured communication intelligence metrics.

### 6.2 Scope
Transcript upload (Zoom/Meet), user speaker tagging, report generation.

### 6.3 Analysis Framework
- Linguistic authority signals
- Conversational dynamics (speaking share, interruptions, reclaim attempts, response latency, frame shifts)
- Structural clarity (ask clarity, question inflation, topic drift)

## 7. Communication Intelligence Report
Sections:
- Firmness Index
- Conversation Dynamics Map
- Key Leverage Moments
- Boundary Clarity Assessment
- Three High-Impact Improvements
- Alternative phrasing suggestions

Visuals:
- Speaking time graph
- Interruption timeline
- Hedge-density heatmap

## 8. Personas & Use Cases
Primary users: high-competence professionals, new managers, ambitious operators.

Core use cases include performance-review debriefs, salary negotiation reviews, boundary conversations, and high-stakes email/Slack communication.

## 9. Roadmap
- Phase 1 (MVP): transcript upload, basic firmness scoring, Gmail overlay, minimal UI
- Phase 2: Slack, trend tracking, stronger interruption detection, richer visuals
- Phase 3: optional voice upload, lightweight real-time capture, education hub

## 10. Technical Architecture Overview
- STT (Whisper or equivalent)
- Speaker diarization
- NLP pipeline (spaCy + rules)
- LLM for contextual suggestions only
- Weighted scoring model
- Chrome extension frontend
- Web app transcript lab

## 11. Risks & Mitigations
Risks: over-inference, privacy, context-misclassification, LLM over-reliance.
Mitigations: transparent scoring, disclaimers, override controls, future local processing options.

## 12. Success Metrics
- Overlay activation and retention
- Transcript uploads per user
- Hedge reduction over 8 weeks
- User-reported communication gains
- 4-week retention

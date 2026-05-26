const allowedGateNames = ["diyas", "diya"];
const gateWrongNameMessages = [
  "THIEF! This tiny machine knows its person.",
  "Ohoooo, trying to invade? The panel is clutching its pearls.",
  "Access denied with theatrical disappointment.",
  "Nice try, mysterious stranger. The machine remains loyal.",
  "Incorrect human detected. Please return this keyboard to Diyas.",
  "The gate squints at you. Suspicious behavior logged in imaginary ink.",
  "Nope. The machine has chosen drama today.",
  "Be gone, name imposter. The revision kingdom is closed."
];
const gateWelcomeMessages = [
  "Gateway unlocked. Welcome, owner.",
  "Yayyyyy, the rightful master has arrived.",
  "Correct human detected. The machine bows politely.",
  "Welcome back, captain of the draft ship.",
  "Access granted. The text kingdom recognizes you.",
  "Owner confirmed. Let the revisions begin."
];
const peekabooGate = document.querySelector("#peekabooGate");
const gateForm = document.querySelector("#gateForm");
const gateName = document.querySelector("#gateName");
const gateMessage = document.querySelector("#gateMessage");
const lockGate = document.querySelector("#lockGate");
const draftInput = document.querySelector("#draftInput");
const revisionOutput = document.querySelector("#revisionOutput");
const flagsList = document.querySelector("#flagsList");
const suggestionsList = document.querySelector("#suggestionsList");
const checklistEl = document.querySelector("#checklist");
const wordCount = document.querySelector("#wordCount");
const sentenceCount = document.querySelector("#sentenceCount");
const genericCount = document.querySelector("#genericCount");
const documentUpload = document.querySelector("#documentUpload");
const fileStatus = document.querySelector("#fileStatus");
const userSuggestions = document.querySelector("#userSuggestions");
const trustScore = document.querySelector("#trustScore");
const trustList = document.querySelector("#trustList");
const complianceScore = document.querySelector("#complianceScore");
const complianceList = document.querySelector("#complianceList");
const suggestionActions = document.querySelector("#suggestionActions");
const claimMap = document.querySelector("#claimMap");
const sourceTracker = document.querySelector("#sourceTracker");
const personalizationGaps = document.querySelector("#personalizationGaps");
const evidenceBuilder = document.querySelector("#evidenceBuilder");
const factAudit = document.querySelector("#factAudit");
const diffView = document.querySelector("#diffView");
const citationHeatmap = document.querySelector("#citationHeatmap");
const historyList = document.querySelector("#historyList");

const controls = {
  clarity: document.querySelector("#clarityToggle"),
  personal: document.querySelector("#personalToggle"),
  citation: document.querySelector("#citationToggle"),
  transition: document.querySelector("#transitionToggle")
};

const sampleText = `Education technology has changed the classroom in many ways. It is important for students because it makes learning better and more engaging. Many studies show that digital tools improve outcomes. Teachers can use platforms to personalize instruction and save time. This proves that technology is the future of education. In conclusion, schools should use more technology because it helps everyone succeed.`;

const genericReplacements = [
  { pattern: /\bin many ways\b/gi, replacement: "in specific, uneven ways", note: "Name the exact way the change happens." },
  { pattern: /\bit is important\b/gi, replacement: "it matters", note: "Explain who it matters to and why." },
  { pattern: /\bmakes? (.*?) better\b/gi, replacement: "can improve $1 when the conditions are clear", note: "Avoid vague improvement claims." },
  { pattern: /\bhelps everyone succeed\b/gi, replacement: "may help some learners make measurable progress", note: "Replace universal claims with precise scope." },
  { pattern: /\bthe future of\b/gi, replacement: "one possible direction for", note: "Soften sweeping predictions." },
  { pattern: /\bthis proves that\b/gi, replacement: "this suggests that", note: "Use evidence-calibrated language." },
  { pattern: /\bin conclusion\b/gi, replacement: "Taken together", note: "Use a transition that points back to the reasoning." },
  { pattern: /\bmore engaging\b/gi, replacement: "more engaging for [describe which learners and why]", note: "Add a concrete audience." },
  { pattern: /\bmany studies show\b/gi, replacement: "research I can cite should show", note: "Attach a real source before final use." }
];

const claimPatterns = [
  /\b(research|studies|data|statistics|experts|evidence)\s+(shows?|suggests?|proves?|indicates?)\b/i,
  /\b\d+(\.\d+)?\s?(%|percent|million|billion|times)\b/i,
  /\b(always|never|everyone|no one|all|none|best|worst|proves?)\b/i,
  /\bcauses?|leads to|results in|because of\b/i
];

const personalSignals = [
  /\bI\b/,
  /\bmy\b/i,
  /\bwe\b/i,
  /\bour\b/i,
  /\bwhen I\b/i,
  /\bin my\b/i,
  /\bfor me\b/i,
  /\bat work\b/i,
  /\bin class\b/i,
  /\bduring\b/i
];

const unsupportedFactSignals = [
  /\bwill\b/i,
  /\bguarantees?\b/i,
  /\bproves?\b/i,
  /\beveryone\b/i,
  /\balways\b/i,
  /\bnever\b/i,
  /\bthe best\b/i,
  /\bthe most\b/i
];

const transitionIdeas = [
  "Use a contrast transition where the draft changes direction: however, by contrast, still, or at the same time.",
  "Use a cause-and-effect transition before consequences: as a result, therefore, or for that reason.",
  "Use a narrowing transition before examples: for example, in my case, or one specific instance is.",
  "Use a synthesis transition near the end: taken together, this pattern suggests, or the main takeaway is."
];

const checklistItems = [
  "I preserved the original meaning and did not invent facts.",
  "I incorporated every writer suggestion intentionally or decided why it does not belong.",
  "I added at least one personal example, observation, or course-specific detail.",
  "I replaced vague phrases with precise wording.",
  "I marked every factual or causal claim that needs a citation.",
  "I added transitions that show how each paragraph connects.",
  "I checked that quoted or borrowed wording is cited or rewritten in my own voice.",
  "I disclosed AI assistance if my class, workplace, or publisher requires it.",
  "I read the revision aloud and made the final choices myself."
];

const extractableTypes = [
  "text/plain",
  "text/markdown"
];
const maxUploadBytes = 25 * 1024 * 1024;
const maxOcrPages = 6;
const maxStoredHistoryItems = 12;
const maxStoredSources = 80;

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

let lastGeneratedRevision = "";
let suggestionActionState = {};
let sourceState = safeReadStorage("btmSources", {});
let historyState = safeReadStorage("btmHistory", []);
let wrongGateAttempts = 0;

function normalizeGateName(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function openPeekabooGate() {
  peekabooGate.classList.add("hidden");
  document.body.classList.remove("gate-locked");
  try {
    localStorage.setItem("btmGateOpen", "true");
  } catch {
    // The gate is playful; storage failure should not block the app.
  }
}

function announceGate(message, className) {
  gateMessage.textContent = message;
  gateMessage.className = "gate-message";
  void gateMessage.offsetWidth;
  gateMessage.className = `gate-message ${className}`;
}

function setupPeekabooGate() {
  if (localStorage.getItem("btmGateOpen") === "true") {
    openPeekabooGate();
    return;
  }

  gateName.focus();
  gateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = normalizeGateName(gateName.value);

    if (allowedGateNames.includes(name)) {
      const message = gateWelcomeMessages[Math.floor(Math.random() * gateWelcomeMessages.length)];
      announceGate(message, "open");
      window.setTimeout(openPeekabooGate, 850);
      return;
    }

    const message = gateWrongNameMessages[wrongGateAttempts % gateWrongNameMessages.length];
    wrongGateAttempts += 1;
    announceGate(message, "alarm");
    gateName.select();
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeReadStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? parsed : fallback;
    }
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function safeWriteStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private mode or when quota is full. The app should still work.
  }
}

function hashText(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return `k${Math.abs(hash)}`;
}

function persistSources() {
  const entries = Object.entries(sourceState)
    .filter(([, value]) => value)
    .slice(-maxStoredSources);
  sourceState = Object.fromEntries(entries);
  safeWriteStorage("btmSources", sourceState);
}

function persistHistory() {
  safeWriteStorage("btmHistory", historyState.slice(0, maxStoredHistoryItems));
}

function getSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function countWords(text) {
  const matches = text.trim().match(/\b[\w'-]+\b/g);
  return matches ? matches.length : 0;
}

function getWriterSuggestions() {
  return userSuggestions.value
    .split(/\r?\n/)
    .map((item) => item.trim().replace(/^[-*]\s+/, ""))
    .filter(Boolean);
}

function getRevisionText() {
  return revisionOutput.innerText.replace(/\n{3,}/g, "\n\n").trim();
}

function sentenceNeedsCitation(sentence) {
  return claimPatterns.some((pattern) => pattern.test(sentence)) && !/\[[^\]]+\]|\([A-Z][^)]+,\s*\d{4}\)/.test(sentence);
}

function sentenceHasPersonalSignal(sentence) {
  return personalSignals.some((pattern) => pattern.test(sentence));
}

function getCitationRisk(sentence) {
  let risk = 0;
  claimPatterns.forEach((pattern) => {
    if (pattern.test(sentence)) risk += 1;
  });
  unsupportedFactSignals.forEach((pattern) => {
    if (pattern.test(sentence)) risk += 1;
  });
  if (/\[[^\]]+\]|\([A-Z][^)]+,\s*\d{4}\)/.test(sentence)) {
    risk = Math.max(0, risk - 2);
  }
  return Math.min(risk, 3);
}

function improveSentence(sentence, index) {
  let revised = sentence;
  const notes = [];

  genericReplacements.forEach(({ pattern, replacement, note }) => {
    pattern.lastIndex = 0;
    if (pattern.test(revised)) {
      revised = revised.replace(pattern, replacement);
      notes.push(note);
    }
  });

  if (controls.clarity.checked) {
    revised = revised
      .replace(/\bvery\b/gi, "")
      .replace(/\breally\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  if (controls.personal.checked && index === 1 && !/\[add/i.test(revised)) {
    revised += " [Add a brief personal example, class detail, workplace moment, or observation that only you could provide.]";
  }

  if (controls.citation.checked && sentenceNeedsCitation(revised)) {
    revised += " [citation needed]";
  }

  return { revised, notes };
}

function applyWriterSuggestionHeuristics(text, writerSuggestions) {
  let revised = text;
  const applied = [];

  writerSuggestions.forEach((item) => {
    const lower = item.toLowerCase();

    if (/\b(warm|human|humane|authentic|personal|voice)\b/.test(lower)) {
      revised = revised
        .replace(/\bmust\b/gi, "should")
        .replace(/\bshould use\b/gi, "can use")
        .replace(/\bThis proves\b/gi, "This suggests");
      revised += "\n\n[Add a sentence in your own voice that explains why this point matters to you or your audience.]";
      applied.push(`Tone/personal voice: ${item}`);
    } else if (/\b(concise|shorter|tighten|less wordy)\b/.test(lower)) {
      revised = revised
        .replace(/\bin order to\b/gi, "to")
        .replace(/\bdue to the fact that\b/gi, "because")
        .replace(/\bit is important to note that\b/gi, "")
        .replace(/\s{2,}/g, " ");
      applied.push(`Concision: ${item}`);
    } else if (/\b(cite|citation|source|evidence|research)\b/.test(lower)) {
      revised += "\n\n[Add the specific source, author, date, or link needed for this evidence.]";
      applied.push(`Evidence: ${item}`);
    } else if (/\b(transition|flow|connect|connection)\b/.test(lower)) {
      revised += "\n\n[Add a transition that explains how the previous point leads to the next one.]";
      applied.push(`Flow: ${item}`);
    } else if (/\b(include|add|mention|example)\b/.test(lower)) {
      revised += `\n\n[Add or revise this section to include: ${item}]`;
      applied.push(`Content: ${item}`);
    }
  });

  return { revised, applied };
}

function buildRevision(text) {
  const writerSuggestions = getWriterSuggestions();

  if (!text.trim()) {
    return {
      html: '<span class="empty-state">Your revision will appear here once you paste a draft.</span>',
      plain: "",
      flags: ["Paste or import draft text to see clarity, originality, citation, and transition guidance."],
      suggestions: writerSuggestions.length
        ? writerSuggestions.map((item) => `Writer instruction queued: ${item}`)
        : ["Start with rough text. The tool will keep your meaning while prompting you to add evidence and personal detail."],
      genericHits: 0
    };
  }

  const sentences = getSentences(text);
  const flags = [];
  const suggestions = [];
  const revisedSentences = [];
  let genericHits = 0;

  sentences.forEach((sentence, index) => {
    const before = sentence;
    const { revised, notes } = improveSentence(sentence, index);
    genericHits += notes.length;

    if (notes.length) {
      flags.push(`<strong>Generic wording:</strong> ${escapeHtml(notes[0])}`);
    }

    if (controls.citation.checked && sentenceNeedsCitation(before)) {
      flags.push(`<strong>Source check:</strong> "${escapeHtml(before)}" needs evidence, a citation, or softer wording.`);
    }

    revisedSentences.push(revised);
  });

  if (controls.transition.checked && sentences.length > 2) {
    suggestions.push(...transitionIdeas.slice(0, 3));
  }

  if (controls.personal.checked) {
    suggestions.push("Add a detail that comes from your context: a moment you noticed, a choice you made, feedback you received, or a local example.");
  }

  writerSuggestions.forEach((item) => {
    suggestions.push(`Required writer change: ${item}`);
  });

  suggestions.push("Before submitting, compare the revision with the source draft and confirm every sentence still means what you intend.");
  suggestions.push("If any wording came from a source or AI output, rewrite it in your own voice and cite or disclose where required.");

  let plain = revisedSentences.join(" ");
  const suggestionPass = applyWriterSuggestionHeuristics(plain, writerSuggestions);
  plain = suggestionPass.revised;
  suggestionPass.applied.forEach((item) => {
    suggestions.push(`Applied direction: ${item}`);
  });

  const html = escapeHtml(plain)
    .replace(/\[citation needed\]/g, '<span class="citation-needed">[citation needed]</span>')
    .replace(/\[(Add|describe|Integrate)[^\]]+\]/g, '<span class="placeholder">$&</span>');

  return {
    html,
    plain,
    flags: flags.length ? flags : ["No major citation or generic-wording flags found. Still verify facts and originality."],
    suggestions,
    genericHits
  };
}

function getDocumentTitle() {
  const file = documentUpload.files && documentUpload.files[0];
  if (!file) return "better-text-machine-revision";
  return file.name.replace(/\.[^.]+$/, "") || "better-text-machine-revision";
}

function getCleanRevisionText() {
  return getRevisionText()
    .replace(/\s*\[(Add|Integrate|describe)[^\]]+\]/gi, "")
    .replace(/\s*\[citation needed\]/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeForCompare(text) {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function getSuggestionKeywords(suggestion) {
  return normalizeForCompare(suggestion)
    .split(" ")
    .filter((word) => word.length > 3)
    .filter((word) => !["make", "more", "less", "with", "that", "this", "from", "into", "include", "mention", "change", "write"].includes(word));
}

function getSuggestionStatus(suggestion, revisionText) {
  const lower = suggestion.toLowerCase();
  const revision = normalizeForCompare(revisionText);
  const keywords = getSuggestionKeywords(suggestion);
  const matched = keywords.filter((keyword) => revision.includes(keyword));

  if (/\b(warm|human|humane|authentic|personal|voice)\b/.test(lower) && /\bI|my|we|our|for me|in my\b/i.test(revisionText)) {
    return { status: "Met", detail: "Personal voice signal appears in the revision." };
  }

  if (/\b(cite|citation|source|evidence|research)\b/.test(lower) && /\[citation needed\]|\([A-Z][^)]+,\s*\d{4}\)|https?:\/\//.test(revisionText)) {
    return { status: "Partial", detail: "Evidence is flagged, but real sources still need to be added." };
  }

  if (matched.length && matched.length >= Math.ceil(Math.max(1, keywords.length) / 2)) {
    return { status: "Met", detail: `Matched keywords: ${matched.join(", ")}.` };
  }

  if (/\b(add|include|mention|example)\b/.test(lower)) {
    return { status: "Needs writer", detail: "The app marked this as a required insertion; add the real detail before export." };
  }

  return { status: "Needs review", detail: "Could not verify this instruction from the text alone." };
}

function renderCompliance(revisionText) {
  const suggestions = getWriterSuggestions();
  if (!suggestions.length) {
    complianceScore.dataset.score = "0%";
    complianceScore.style.background = "conic-gradient(var(--accent) 0deg, #e8ecef 0deg)";
    renderList(complianceList, ["Add suggestions to measure compliance."]);
    return;
  }

  const statuses = suggestions.map((suggestion) => ({
    suggestion,
    ...getSuggestionStatus(suggestion, revisionText)
  }));
  const points = statuses.reduce((sum, item) => {
    if (item.status === "Met") return sum + 1;
    if (item.status === "Partial") return sum + 0.5;
    return sum;
  }, 0);
  const score = Math.round((points / suggestions.length) * 100);
  const degrees = Math.round((score / 100) * 360);
  complianceScore.dataset.score = `${score}%`;
  complianceScore.style.background = `conic-gradient(var(--accent) ${degrees}deg, #e8ecef ${degrees}deg)`;
  renderList(
    complianceList,
    statuses.map((item) => `<strong>${item.status}:</strong> ${escapeHtml(item.suggestion)}. ${escapeHtml(item.detail)}`),
    true
  );
}

function renderSuggestionActions(revisionText) {
  const suggestions = getWriterSuggestions();
  if (!suggestions.length) {
    renderList(suggestionActions, ["Add suggestions to track apply/ignore decisions."]);
    return;
  }

  suggestionActions.innerHTML = "";
  suggestions.forEach((suggestion) => {
    const key = hashText(suggestion);
    const status = suggestionActionState[key] || "review";
    const li = document.createElement("li");
    const text = document.createElement("p");
    const buttons = document.createElement("div");
    text.textContent = suggestion;
    buttons.className = "mini-buttons";

    ["apply", "ignore", "rewrite"].forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `mini-button ${status === action ? "active" : ""}`;
      button.textContent = action === "apply" ? "Apply" : action === "ignore" ? "Ignore" : "Needs rewrite";
      button.addEventListener("click", () => {
        suggestionActionState[key] = action;
        if (action === "apply" && !normalizeForCompare(revisionText).includes(normalizeForCompare(suggestion).slice(0, 24))) {
          appendToRevision(`[Add or revise this section to include: ${suggestion}]`);
        }
        renderIntegrityReview(draftInput.value, getRevisionText());
      });
      buttons.appendChild(button);
    });

    li.append(text, buttons);
    suggestionActions.appendChild(li);
  });
}

function renderTrustScore(draftText, revisionText) {
  if (!draftText.trim() && !revisionText.trim()) {
    trustScore.dataset.score = "0%";
    trustScore.style.background = "conic-gradient(var(--accent) 0deg, #e8ecef 0deg)";
    renderList(trustList, ["Add a draft or upload a document to calculate trust."]);
    return;
  }

  const revisionSentences = getSentences(revisionText);
  const claimCount = revisionSentences.filter((sentence) => getCitationRisk(sentence) > 0).length;
  const sourceCount = Object.values(sourceState).filter(Boolean).length;
  const personalCount = revisionSentences.filter(sentenceHasPersonalSignal).length;
  const promptCount = (revisionText.match(/\[(Add|Integrate|describe|citation needed)[^\]]*\]/gi) || []).length;
  const checkedCount = checklistEl ? checklistEl.querySelectorAll("input:checked").length : 0;
  const suggestionCount = getWriterSuggestions().length;
  const decidedSuggestions = Object.values(suggestionActionState).filter((value) => value !== "review").length;

  let score = 0;
  if (draftText.trim()) score += 20;
  if (revisionText.trim()) score += 15;
  score += Math.min(20, sourceCount * 8);
  score += Math.min(15, personalCount * 5);
  score += Math.min(15, checkedCount * 2);
  if (suggestionCount) score += Math.min(10, Math.round((decidedSuggestions / suggestionCount) * 10));
  score -= Math.min(30, promptCount * 8);
  score -= Math.max(0, claimCount - sourceCount) * 5;
  score = Math.max(0, Math.min(100, score));

  const degrees = Math.round((score / 100) * 360);
  trustScore.dataset.score = `${score}%`;
  trustScore.style.background = `conic-gradient(var(--accent) ${degrees}deg, #e8ecef ${degrees}deg)`;

  renderList(trustList, [
    `${sourceCount} source field${sourceCount === 1 ? "" : "s"} filled for flagged claims.`,
    `${personalCount} sentence${personalCount === 1 ? "" : "s"} include personal context signals.`,
    `${promptCount} unresolved bracketed prompt${promptCount === 1 ? "" : "s"} remain.`,
    `${checkedCount} responsibility checklist item${checkedCount === 1 ? "" : "s"} completed.`
  ]);
}

function renderClaimMap(sentences) {
  const claims = sentences
    .map((sentence, index) => ({ sentence, index, risk: getCitationRisk(sentence) }))
    .filter((item) => item.risk > 0 || sentenceNeedsCitation(item.sentence));

  renderList(
    claimMap,
    claims.length
      ? claims.map((item) => `<strong>Sentence ${item.index + 1}:</strong> ${escapeHtml(item.sentence)}`)
      : ["No evidence-heavy claims found."],
    true
  );
}

function renderSourceTracker(sentences) {
  const claims = sentences
    .map((sentence, index) => ({ sentence, index, key: hashText(sentence), risk: getCitationRisk(sentence) }))
    .filter((item) => item.risk > 0 || sentenceNeedsCitation(item.sentence))
    .slice(0, 8);

  if (!claims.length) {
    sourceTracker.innerHTML = '<span class="empty-state">No source-heavy claims to track yet.</span>';
    return;
  }

  sourceTracker.innerHTML = "";
  claims.forEach((claim) => {
    const row = document.createElement("div");
    const sentence = document.createElement("p");
    const label = document.createElement("label");
    const input = document.createElement("input");
    row.className = "source-row";
    sentence.innerHTML = `<strong>Sentence ${claim.index + 1}:</strong> ${escapeHtml(claim.sentence)}`;
    label.textContent = "Source, citation, or verification note";
    input.value = sourceState[claim.key] || "";
    input.placeholder = "Author, title, link, dataset, class material, or personal record";
    input.addEventListener("input", () => {
      sourceState[claim.key] = input.value.trim();
      persistSources();
      renderTrustScore(draftInput.value, getRevisionText());
    });
    label.appendChild(input);
    row.append(sentence, label);
    sourceTracker.appendChild(row);
  });
}

function renderPersonalizationGaps(sentences) {
  const gaps = sentences
    .map((sentence, index) => ({ sentence, index }))
    .filter((item) => item.sentence.length > 70 && !sentenceHasPersonalSignal(item.sentence))
    .slice(0, 6);

  renderList(
    personalizationGaps,
    gaps.length
      ? gaps.map((item) => `<strong>Sentence ${item.index + 1}:</strong> Add a concrete experience, audience, place, course, project, or decision.`)
      : ["The draft already has some personal signals. Check that they are specific and true."],
    true
  );

  renderEvidenceBuilder(gaps);
}

function renderEvidenceBuilder(gaps) {
  if (!gaps.length) {
    evidenceBuilder.innerHTML = "";
    return;
  }

  evidenceBuilder.innerHTML = "";
  gaps.slice(0, 3).forEach((gap) => {
    const card = document.createElement("div");
    const text = document.createElement("p");
    const inputs = ["What happened?", "Where or when?", "What did you learn?"].map((labelText) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      label.textContent = labelText;
      input.placeholder = labelText;
      label.appendChild(input);
      return { label, input };
    });
    const button = document.createElement("button");
    card.className = "evidence-card";
    text.innerHTML = `<strong>Build evidence for sentence ${gap.index + 1}</strong>`;
    button.type = "button";
    button.className = "mini-button";
    button.textContent = "Insert personal evidence";
    button.addEventListener("click", () => {
      const values = inputs.map((item) => item.input.value.trim()).filter(Boolean);
      if (!values.length) return;
      appendToRevision(`Personal evidence to integrate: ${values.join(" ")}`);
    });
    card.append(text, ...inputs.map((item) => item.label), button);
    evidenceBuilder.appendChild(card);
  });
}

function renderFactAudit(sentences) {
  const auditItems = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      risk: unsupportedFactSignals.some((pattern) => pattern.test(sentence)) || sentenceNeedsCitation(sentence)
    }))
    .filter((item) => item.risk)
    .slice(0, 8);

  renderList(
    factAudit,
    auditItems.length
      ? auditItems.map((item) => `<strong>Verify:</strong> ${escapeHtml(item.sentence)} Do not invent data, dates, outcomes, or sources.`)
      : ["No strong invention-risk signals found. Still verify names, dates, claims, and sources."],
    true
  );
}

function renderDiff(beforeText, afterText) {
  const before = getSentences(beforeText);
  const after = getSentences(afterText);
  const max = Math.max(before.length, after.length);
  const beforeRows = [];
  const afterRows = [];

  for (let index = 0; index < max; index += 1) {
    const left = before[index] || "";
    const right = after[index] || "";
    const changed = normalizeForCompare(left) !== normalizeForCompare(right);
    beforeRows.push(`<p class="${changed ? "diff-changed" : ""}">${escapeHtml(left || " ")}</p>`);
    afterRows.push(`<p class="${changed ? "diff-added" : ""}">${escapeHtml(right || " ")}</p>`);
  }

  diffView.innerHTML = `
    <div class="diff-column"><h3>Before</h3>${beforeRows.join("") || "<p>No draft yet.</p>"}</div>
    <div class="diff-column"><h3>After</h3>${afterRows.join("") || "<p>No revision yet.</p>"}</div>
  `;
}

function renderCitationHeatmap(sentences) {
  if (!sentences.length) {
    citationHeatmap.innerHTML = '<span class="empty-state">Citation risk will appear here after a draft is added.</span>';
    return;
  }

  citationHeatmap.innerHTML = sentences.map((sentence, index) => {
    const risk = getCitationRisk(sentence);
    const label = risk >= 3 ? "High" : risk === 2 ? "Medium" : risk === 1 ? "Low" : "Clear";
    const className = risk >= 3 ? "heat-high" : risk === 2 ? "heat-medium" : "heat-low";
    return `
      <div class="heat-item">
        <strong>${label}</strong>
        <div class="heat-bar ${className}">S${index + 1}: ${escapeHtml(sentence)}</div>
      </div>
    `;
  }).join("");
}

function appendToRevision(text) {
  const current = getRevisionText();
  const next = current ? `${current}\n\n${text}` : text;
  revisionOutput.textContent = next;
  revisionOutput.dataset.plainText = next;
  renderIntegrityReview(draftInput.value, next);
}

function renderHistory() {
  if (!historyState.length) {
    renderList(historyList, ["Save a version to build revision history."]);
    return;
  }

  historyList.innerHTML = "";
  historyState.forEach((item, index) => {
    const li = document.createElement("li");
    const text = document.createElement("p");
    const buttons = document.createElement("div");
    const load = document.createElement("button");
    const remove = document.createElement("button");
    text.textContent = `${item.title} - ${item.date}`;
    buttons.className = "mini-buttons";
    load.type = "button";
    load.className = "mini-button";
    load.textContent = "Load";
    load.addEventListener("click", () => {
      revisionOutput.textContent = item.text;
      revisionOutput.dataset.plainText = item.text;
      renderIntegrityReview(draftInput.value, item.text);
    });
    remove.type = "button";
    remove.className = "mini-button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      historyState.splice(index, 1);
      persistHistory();
      renderHistory();
    });
    buttons.append(load, remove);
    li.append(text, buttons);
    historyList.appendChild(li);
  });
}

function saveCurrentVersion() {
  const text = getRevisionText();
  if (!text) return;
  historyState.unshift({
    title: getDocumentTitle(),
    date: new Date().toLocaleString(),
    text
  });
  historyState = historyState.slice(0, 12);
  persistHistory();
  renderHistory();
}

function renderIntegrityReview(draftText, revisionText) {
  const draftSentences = getSentences(draftText);
  const revisionSentences = getSentences(revisionText);
  renderTrustScore(draftText, revisionText);
  renderCompliance(revisionText);
  renderSuggestionActions(revisionText);
  renderClaimMap(draftSentences);
  renderSourceTracker(draftSentences);
  renderPersonalizationGaps(draftSentences);
  renderFactAudit(draftSentences);
  renderDiff(draftText, revisionText);
  renderCitationHeatmap(revisionSentences.length ? revisionSentences : draftSentences);
  renderHistory();
}

function buildExportHtml() {
  const title = escapeHtml(getDocumentTitle());
  const text = escapeHtml(getCleanRevisionText())
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
  const suggestions = getWriterSuggestions()
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; line-height: 1.55; color: #202124; }
    h1 { font-family: Arial, sans-serif; font-size: 22px; }
    h2 { font-family: Arial, sans-serif; font-size: 15px; margin-top: 24px; }
    p { margin: 0 0 12px; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <h2>Revised Draft</h2>
  ${text || "<p>No revision yet.</p>"}
</body>
</html>`;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function buildDocxBlob() {
  if (!window.JSZip) {
    return null;
  }

  const zip = new window.JSZip();
  const title = getDocumentTitle();
  const paragraphs = getCleanRevisionText()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const paragraphXml = [
    `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>`,
    ...paragraphs.map((paragraph) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(paragraph)}</w:t></w:r></w:p>`)
  ].join("");

  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
  zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  zip.folder("word").file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphXml || "<w:p/>"}
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>`);

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
}

function downloadBlob(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function renderList(element, items, allowHtml = false) {
  element.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    if (allowHtml) {
      li.innerHTML = item;
    } else {
      li.textContent = item;
    }
    element.appendChild(li);
  });
}

function renderChecklist() {
  checklistEl.innerHTML = "";
  checklistItems.forEach((item, index) => {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    const label = document.createElement("label");
    checkbox.type = "checkbox";
    checkbox.id = `check-${index}`;
    label.htmlFor = checkbox.id;
    label.textContent = item;
    li.append(checkbox, label);
    checklistEl.appendChild(li);
  });
}

function update() {
  const text = draftInput.value;
  const result = buildRevision(text);
  revisionOutput.innerHTML = result.html;
  renderList(flagsList, result.flags, true);
  renderList(suggestionsList, result.suggestions);
  wordCount.textContent = `${countWords(text)} words`;
  sentenceCount.textContent = `${getSentences(text).length} sentences`;
  genericCount.textContent = `${result.genericHits} generic phrases`;
  revisionOutput.dataset.plainText = result.plain;
  lastGeneratedRevision = result.plain;
  renderIntegrityReview(text, result.plain);
}

function downloadChecklist() {
  const checked = [...checklistEl.querySelectorAll("input")].map((box, index) => {
    const mark = box.checked ? "x" : " ";
    return `- [${mark}] ${checklistItems[index]}`;
  });

  const content = [
    "# Better Text Machine Revision Checklist",
    "",
    "## Revised Draft",
    getCleanRevisionText(),
    "",
    "## Checklist",
    ...checked
  ].join("\n");

  downloadBlob(content, "text/markdown", "revision-checklist.md");
}

async function exportWord() {
  const docxBlob = await buildDocxBlob();
  if (docxBlob) {
    const url = URL.createObjectURL(docxBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${getDocumentTitle()}-revision.docx`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  downloadBlob(buildExportHtml(), "application/msword", `${getDocumentTitle()}-revision.doc`);
}

function exportPdf() {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.opener = null;
  printWindow.document.open();
  printWindow.document.write(buildExportHtml());
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF extraction needs internet access to load PDF.js. Reload the page after connecting.");
  }

  const data = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    fileStatus.textContent = `Reading page ${pageNumber} of ${pdf.numPages}`;
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (text) {
      pages.push(text);
    }
  }

  if (pages.join("").trim()) {
    return pages.join("\n\n");
  }

  if (!window.Tesseract) {
    return "";
  }

  const ocrPages = [];
  const pagesToOcr = Math.min(pdf.numPages, maxOcrPages);
  for (let pageNumber = 1; pageNumber <= pagesToOcr; pageNumber += 1) {
    fileStatus.textContent = `OCR page ${pageNumber} of ${pagesToOcr}`;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;
    const result = await window.Tesseract.recognize(canvas, "eng");
    const text = result.data.text.replace(/\s+/g, " ").trim();
    if (text) {
      ocrPages.push(text);
    }
  }

  const ocrText = ocrPages.join("\n\n");
  if (ocrText && pdf.numPages > maxOcrPages) {
    return `${ocrText}\n\n[OCR stopped after ${maxOcrPages} pages to keep the browser responsive.]`;
  }
  return ocrText;
}

async function extractDocxText(file) {
  if (!window.mammoth) {
    throw new Error("DOCX extraction needs internet access to load Mammoth.js. Reload the page after connecting.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

function loadDocument(file) {
  if (file.size > maxUploadBytes) {
    fileStatus.textContent = "File too large";
    draftInput.value = "";
    draftInput.placeholder = "For browser safety, upload files smaller than 25 MB.";
    update();
    return;
  }

  const extension = file.name.split(".").pop().toLowerCase();
  const isPdf = file.type === "application/pdf" || extension === "pdf";
  const isDocx = extension === "docx";
  const canReadText = extractableTypes.includes(file.type) || ["txt", "md", "markdown"].includes(extension);

  if (isPdf) {
    fileStatus.textContent = `Reading ${file.name}`;
    draftInput.value = "";
    draftInput.placeholder = "Extracting PDF text...";
    update();

    extractPdfText(file)
      .then((text) => {
        draftInput.value = text;
        draftInput.placeholder = "Paste your draft here...";
        fileStatus.textContent = text ? `${file.name} loaded` : `${file.name} has no readable text`;
        if (!text) {
          draftInput.placeholder = "No readable text was found. The PDF may be image-only, handwritten, protected, or too low quality for OCR.";
        }
        update();
      })
      .catch((error) => {
        fileStatus.textContent = "PDF extraction failed";
        draftInput.placeholder = error.message;
        update();
      });
    return;
  }

  if (isDocx) {
    fileStatus.textContent = `Reading ${file.name}`;
    draftInput.value = "";
    draftInput.placeholder = "Extracting Word document text...";
    update();

    extractDocxText(file)
      .then((text) => {
        draftInput.value = text;
        draftInput.placeholder = "Paste your draft here...";
        fileStatus.textContent = text ? `${file.name} loaded` : `${file.name} has no readable text`;
        update();
      })
      .catch((error) => {
        fileStatus.textContent = "DOCX extraction failed";
        draftInput.placeholder = error.message;
        update();
      });
    return;
  }

  if (!canReadText) {
    fileStatus.textContent = `${file.name} selected`;
    draftInput.value = "";
    draftInput.placeholder = "Legacy .doc extraction is not built in. Upload PDF, DOCX, text, or Markdown, or paste the document text here.";
    update();
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    draftInput.value = String(reader.result || "");
    draftInput.placeholder = "Paste your draft here...";
    fileStatus.textContent = `${file.name} loaded`;
    update();
  });
  reader.addEventListener("error", () => {
    fileStatus.textContent = "Could not read file";
  });
  reader.readAsText(file);
}

draftInput.addEventListener("input", update);
userSuggestions.addEventListener("input", update);
Object.values(controls).forEach((control) => control.addEventListener("change", update));
revisionOutput.addEventListener("input", () => {
  const text = getRevisionText();
  revisionOutput.dataset.plainText = text;
  renderIntegrityReview(draftInput.value, text);
});
checklistEl.addEventListener("change", () => {
  renderTrustScore(draftInput.value, getRevisionText());
});

documentUpload.addEventListener("change", () => {
  const file = documentUpload.files && documentUpload.files[0];
  if (file) loadDocument(file);
});

document.querySelector("#sampleButton").addEventListener("click", () => {
  draftInput.value = sampleText;
  draftInput.placeholder = "Paste your draft here...";
  fileStatus.textContent = "Sample loaded";
  update();
});

document.querySelector("#copyRevision").addEventListener("click", async () => {
  const text = revisionOutput.dataset.plainText || "";
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.left = "-9999px";
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  }
});

document.querySelector("#downloadChecklist").addEventListener("click", downloadChecklist);
document.querySelector("#exportWord").addEventListener("click", exportWord);
document.querySelector("#exportPdf").addEventListener("click", exportPdf);
document.querySelector("#cleanPrompts").addEventListener("click", () => {
  revisionOutput.textContent = getCleanRevisionText();
  revisionOutput.dataset.plainText = getRevisionText();
  renderIntegrityReview(draftInput.value, getRevisionText());
});
document.querySelector("#saveVersion").addEventListener("click", saveCurrentVersion);
document.querySelector("#resetChecks").addEventListener("click", () => {
  renderChecklist();
  renderTrustScore(draftInput.value, getRevisionText());
});
document.querySelector("#clearHistory").addEventListener("click", () => {
  historyState = [];
  persistHistory();
  renderHistory();
  renderTrustScore(draftInput.value, getRevisionText());
});
document.querySelector("#clearSuggestions").addEventListener("click", () => {
  userSuggestions.value = "";
  suggestionActionState = {};
  update();
});
lockGate.addEventListener("click", () => {
  localStorage.removeItem("btmGateOpen");
  peekabooGate.classList.remove("hidden");
  document.body.classList.add("gate-locked");
  gateName.value = "";
  announceGate("The machine is peeking again.", "");
  gateName.focus();
});

setupPeekabooGate();
renderChecklist();
update();

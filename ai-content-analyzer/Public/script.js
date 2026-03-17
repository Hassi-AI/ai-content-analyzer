// ===========================
// DOM ELEMENTS
// ===========================
const contentInput = document.getElementById("contentInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const charCount = document.getElementById("charCount");
const newAnalysisBtn = document.getElementById("newAnalysisBtn");
const retryBtn = document.getElementById("retryBtn");

// Sections
const loadingSection = document.getElementById("loadingSection");
const resultsSection = document.getElementById("resultsSection");
const errorSection = document.getElementById("errorSection");

// Loading Steps
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

// Stats
const statWords = document.getElementById("statWords");
const statSentimentVal = document.getElementById("statSentimentVal");
const statReadabilityVal = document.getElementById("statReadabilityVal");
const statSEOVal = document.getElementById("statSEOVal");

// Cards
const summaryText = document.getElementById("summaryText");
const toneBadges = document.getElementById("toneBadges");
const toneExplanation = document.getElementById("toneExplanation");
const readabilityCircle = document.getElementById("readabilityCircle");
const readabilityScore = document.getElementById("readabilityScore");
const readabilityLevel = document.getElementById("readabilityLevel");
const readabilityExplanation = document.getElementById("readabilityExplanation");
const seoScoreText = document.getElementById("seoScoreText");
const seoScoreBar = document.getElementById("seoScoreBar");
const seoStrengths = document.getElementById("seoStrengths");
const seoSuggestions = document.getElementById("seoSuggestions");
const improveStructure = document.getElementById("improveStructure");
const improveContent = document.getElementById("improveContent");
const improveEngagement = document.getElementById("improveEngagement");
const errorMessage = document.getElementById("errorMessage");

// ===========================
// CHARACTER COUNTER
// ===========================
contentInput.addEventListener("input", () => {
  const length = contentInput.value.length;
  charCount.textContent = length.toLocaleString();

  // Color feedback
  if (length > 5000) {
    charCount.style.color = "#ef4444";
  } else if (length > 2000) {
    charCount.style.color = "#f59e0b";
  } else {
    charCount.style.color = "";
  }
});

// ===========================
// CLEAR BUTTON
// ===========================
clearBtn.addEventListener("click", () => {
  contentInput.value = "";
  charCount.textContent = "0";
  charCount.style.color = "";
  contentInput.focus();
  hideAllSections();
});

// ===========================
// NEW ANALYSIS BUTTON
// ===========================
newAnalysisBtn.addEventListener("click", () => {
  hideAllSections();
  contentInput.value = "";
  charCount.textContent = "0";
  charCount.style.color = "";
  contentInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===========================
// RETRY BUTTON
// ===========================
retryBtn.addEventListener("click", () => {
  hideAllSections();
  analyzeContent();
});

// ===========================
// ANALYZE BUTTON
// ===========================
analyzeBtn.addEventListener("click", () => {
  analyzeContent();
});

// Allow Ctrl+Enter to analyze
contentInput.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    analyzeContent();
  }
});

// ===========================
// HIDE ALL SECTIONS
// ===========================
function hideAllSections() {
  loadingSection.classList.remove("active");
  resultsSection.classList.remove("active");
  errorSection.classList.remove("active");
}

// ===========================
// SHOW ERROR
// ===========================
function showError(message) {
  hideAllSections();
  errorMessage.textContent = message;
  errorSection.classList.add("active");
  analyzeBtn.disabled = false;
  analyzeBtn.innerHTML = `
    <i class="fa-solid fa-magnifying-glass-chart"></i>
    <span>Analyze Content</span>
  `;
}

// ===========================
// LOADING STEPS ANIMATION
// ===========================
function animateLoadingSteps() {
  // Reset all steps
  step1.className = "step";
  step2.className = "step";
  step3.className = "step";

  step1.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><span>Reading content</span>`;

  setTimeout(() => {
    step1.className = "step active";
    step1.innerHTML = `<i class="fa-solid fa-check-circle"></i><span>Reading content</span>`;
    step2.className = "step processing";
    step2.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><span>Processing with AI</span>`;
  }, 800);

  setTimeout(() => {
    step2.className = "step active";
    step2.innerHTML = `<i class="fa-solid fa-check-circle"></i><span>Processing with AI</span>`;
    step3.className = "step processing";
    step3.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><span>Generating report</span>`;
  }, 2000);
}

// ===========================
// MAIN ANALYZE FUNCTION
// ===========================
async function analyzeContent() {
  const content = contentInput.value.trim();

  // Validate input
  if (!content) {
    showError("Please paste some content before analyzing.");
    return;
  }

  if (content.length < 20) {
    showError("Content is too short. Please provide at least 20 characters.");
    return;
  }

  // Show loading
  hideAllSections();
  loadingSection.classList.add("active");
  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = `
    <i class="fa-solid fa-circle-notch fa-spin"></i>
    <span>Analyzing...</span>
  `;

  // Start loading animation
  animateLoadingSteps();

  // Scroll to loading
  loadingSection.scrollIntoView({ behavior: "smooth", block: "center" });

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Analysis failed. Please try again.");
    }

    // Complete step 3
    setTimeout(() => {
      step3.className = "step active";
      step3.innerHTML = `<i class="fa-solid fa-check-circle"></i><span>Generating report</span>`;
    }, 500);

    // Show results after short delay
    setTimeout(() => {
      displayResults(data.analysis);
    }, 800);

  } catch (error) {
    console.error("Analysis error:", error);
    showError(error.message || "Something went wrong. Please try again.");
  }
}

// ===========================
// DISPLAY RESULTS
// ===========================
function displayResults(analysis) {
  // Hide loading
  loadingSection.classList.remove("active");

  // ---- STATS ROW ----
  statWords.textContent = analysis.wordCount || "—";
  statSentimentVal.textContent = analysis.sentiment || "—";
  statReadabilityVal.textContent = analysis.readability?.level || "—";
  statSEOVal.textContent = (analysis.seo?.score || "—") + "/10";

  // ---- SUMMARY ----
  summaryText.textContent = analysis.summary || "No summary available.";

  // ---- TONE ----
  toneBadges.innerHTML = "";

  if (analysis.tone?.primary) {
    const primaryBadge = document.createElement("span");
    primaryBadge.className = "tone-badge primary";
    primaryBadge.textContent = analysis.tone.primary;
    toneBadges.appendChild(primaryBadge);
  }

  if (analysis.tone?.secondary) {
    const secondaryBadge = document.createElement("span");
    secondaryBadge.className = "tone-badge secondary";
    secondaryBadge.textContent = analysis.tone.secondary;
    toneBadges.appendChild(secondaryBadge);
  }

  toneExplanation.textContent = analysis.tone?.explanation || "—";

  // ---- READABILITY ----
  const rScore = analysis.readability?.score || "—";
  readabilityScore.textContent = rScore;
  readabilityLevel.textContent = analysis.readability?.level || "—";
  readabilityExplanation.textContent = analysis.readability?.explanation || "—";

  // Color score circle based on score
  const scoreNum = parseInt(rScore);
  if (scoreNum >= 8) {
    readabilityCircle.style.background = "linear-gradient(135deg, #10b981, #06b6d4)";
  } else if (scoreNum >= 5) {
    readabilityCircle.style.background = "linear-gradient(135deg, #f59e0b, #06b6d4)";
  } else {
    readabilityCircle.style.background = "linear-gradient(135deg, #ef4444, #f59e0b)";
  }

  // ---- SEO ----
  const seoScore = analysis.seo?.score || 0;
  seoScoreText.textContent = `${seoScore}/10`;

  // Animate bar
  setTimeout(() => {
    seoScoreBar.style.width = `${(seoScore / 10) * 100}%`;
  }, 300);

  // SEO bar color
  if (seoScore >= 8) {
    seoScoreBar.style.background = "linear-gradient(90deg, #10b981, #06b6d4)";
  } else if (seoScore >= 5) {
    seoScoreBar.style.background = "linear-gradient(90deg, #f59e0b, #10b981)";
  } else {
    seoScoreBar.style.background = "linear-gradient(90deg, #ef4444, #f59e0b)";
  }

  // SEO Strengths
  seoStrengths.innerHTML = "";
  const strengths = analysis.seo?.strengths || [];
  if (strengths.length === 0) {
    seoStrengths.innerHTML = "<li>No strengths identified</li>";
  } else {
    strengths.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      seoStrengths.appendChild(li);
    });
  }

  // SEO Suggestions
  seoSuggestions.innerHTML = "";
  const suggestions = analysis.seo?.suggestions || [];
  if (suggestions.length === 0) {
    seoSuggestions.innerHTML = "<li>No suggestions available</li>";
  } else {
    suggestions.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      seoSuggestions.appendChild(li);
    });
  }

  // ---- IMPROVEMENTS ----
  populateList(improveStructure, analysis.improvements?.structure);
  populateList(improveContent, analysis.improvements?.content);
  populateList(improveEngagement, analysis.improvements?.engagement);

  // Show results section
  resultsSection.classList.add("active");

  // Re-enable button
  analyzeBtn.disabled = false;
  analyzeBtn.innerHTML = `
    <i class="fa-solid fa-magnifying-glass-chart"></i>
    <span>Analyze Content</span>
  `;

  // Scroll to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

// ===========================
// HELPER: POPULATE LIST
// ===========================
function populateList(element, items) {
  element.innerHTML = "";
  if (!items || items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No suggestions available";
    element.appendChild(li);
    return;
  }
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  });
}

// ===========================
// INIT — Focus textarea
// ===========================
window.addEventListener("load", () => {
  contentInput.focus();
});
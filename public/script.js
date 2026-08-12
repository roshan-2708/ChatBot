/* =========================================================
   EDUASSIST AI STUDIO — INTERACTIVE CLIENT LOGIC
   ========================================================= */

// DOM Elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");
const sendButton = document.getElementById("sendButton");
const clearButton = document.getElementById("clearButton");

// Sidebar & Selectors
const studioSidebar = document.getElementById("studioSidebar");
const mobileSidebarToggle = document.getElementById("mobileSidebarToggle");
const roleGrid = document.getElementById("roleGrid");
const roleCards = document.querySelectorAll(".role-card");
const roleSelector = document.getElementById("roleSelector");

const techniquePills = document.getElementById("techniquePills");
const techniqueChips = document.querySelectorAll(".technique-chip");
const techniqueSelector = document.getElementById("techniqueSelector");
const techniqueBadge = document.getElementById("techniqueBadge");
const techniqueDescription = document.getElementById("techniqueDescription");

// Live Matrix Elements
const currentRole = document.getElementById("currentRole");
const currentTechnique = document.getElementById("currentTechnique");

// Suggestion buttons
const suggestionButtons = document.querySelectorAll(".suggestion-button");

// About Modal Elements
const aboutButton = document.getElementById("aboutButton");
const aboutModal = document.getElementById("aboutModal");
const closeAboutButton = document.getElementById("closeAboutButton");
const closeAboutFooterButton = document.getElementById("closeAboutFooterButton");

// Prompt Preview Modal Elements
const viewPromptButton = document.getElementById("viewPromptButton");
const promptModal = document.getElementById("promptModal");
const closePromptButton = document.getElementById("closePromptButton");
const closePromptFooterButton = document.getElementById("closePromptFooterButton");
const copyPromptButton = document.getElementById("copyPromptButton");
const finalPromptPreview = document.getElementById("finalPromptPreview");
const promptPreviewRole = document.getElementById("promptPreviewRole");
const promptPreviewTechnique = document.getElementById("promptPreviewTechnique");

let lastUserMessage = "";

// Technique knowledge dictionary
const techniqueInformation = {
  "zero-shot": {
    badge: "Zero-Shot",
    description: "Direct prompting without sample examples for direct, concise answers.",
  },
  "one-shot": {
    badge: "One-Shot",
    description: "AI is provided with 1 high-quality example to guide formatting and tone.",
  },
  "few-shot": {
    badge: "Few-Shot",
    description: "AI is provided with multiple varied examples to match exact response patterns.",
  },
  "role-based": {
    badge: "Role-Based",
    description: "Strictly adopts the selected professional domain persona and behavioral constraints.",
  },
  "structured-reasoning": {
    badge: "Structured Reasoning",
    description: "Breaks problem down into verified steps: Given info, Concepts, Methods & Final conclusion.",
  },
};

const roleFriendlyNames = {
  student: "Student Assistant",
  teacher: "Professor / Teacher",
  programmer: "Senior Developer",
  interviewer: "HR / Tech Interviewer",
  cloud: "Cloud Architect",
  assignment: "Academic Writer",
};

/* =========================================================
   ROLE & TECHNIQUE MANAGEMENT
   ========================================================= */

function getSelectedRole() {
  return roleSelector ? roleSelector.value : "student";
}

function getSelectedRoleText() {
  const val = getSelectedRole();
  return roleFriendlyNames[val] || val;
}

function getSelectedTechnique() {
  return techniqueSelector ? techniqueSelector.value : "zero-shot";
}

function getSelectedTechniqueText() {
  const val = getSelectedTechnique();
  const info = techniqueInformation[val];
  return info ? info.badge : val;
}

function updateTechniqueInformation() {
  const selectedTech = getSelectedTechnique();
  const info = techniqueInformation[selectedTech];

  if (!info) return;

  if (techniqueBadge) techniqueBadge.textContent = info.badge;
  if (techniqueDescription) techniqueDescription.textContent = info.description;
}

function updateConfigurationPanel() {
  if (currentRole) {
    currentRole.textContent = getSelectedRoleText();
  }
  if (currentTechnique) {
    currentTechnique.textContent = getSelectedTechniqueText() + " Prompting";
  }
}

// Handle Role Card Selection
roleCards.forEach((card) => {
  card.addEventListener("click", () => {
    roleCards.forEach((c) => c.classList.remove("active"));
    card.classList.add("active");

    const role = card.getAttribute("data-role");
    if (roleSelector) {
      roleSelector.value = role;
    }

    updateConfigurationPanel();

    addNotificationMessage(
      `Role switched to **${getSelectedRoleText()}**. Future queries will follow this persona.`
    );

    // Auto-close sidebar on mobile if open
    if (window.innerWidth <= 980 && studioSidebar) {
      studioSidebar.classList.remove("open");
    }
  });
});

// Handle Technique Chip Selection
techniqueChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    techniqueChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");

    const tech = chip.getAttribute("data-technique");
    if (techniqueSelector) {
      techniqueSelector.value = tech;
    }

    updateTechniqueInformation();
    updateConfigurationPanel();
  });
});

/* Mobile Sidebar Toggle */
if (mobileSidebarToggle && studioSidebar) {
  mobileSidebarToggle.addEventListener("click", () => {
    studioSidebar.classList.toggle("open");
  });
}

/* =========================================================
   PROMPT PREVIEW BUILDER
   ========================================================= */

function buildPromptPreview() {
  const roleText = getSelectedRoleText();
  const techniqueText = getSelectedTechniqueText();

  const userQuestion =
    userInput.value.trim() ||
    lastUserMessage ||
    "How does machine learning work in simple terms?";

  if (promptPreviewRole) promptPreviewRole.textContent = roleText;
  if (promptPreviewTechnique) promptPreviewTechnique.textContent = techniqueText;

  const finalPrompt = `
CHATBOT ROLE INSTRUCTIONS:
Persona: ${roleText}

PROMPT ENGINEERING TECHNIQUE:
Strategy: ${techniqueText} Prompting

GENERAL RESPONSE RULES:
1. Answer the user's actual academic/technical request.
2. Keep response structured using Markdown (Headings, Bullet points, Code blocks).
3. Ensure accuracy and adapt depth according to persona.

USER REQUEST:
${userQuestion}
`.trim();

  if (finalPromptPreview) {
    finalPromptPreview.textContent = finalPrompt;
  }

  return finalPrompt;
}

/* =========================================================
   MODAL CONTROLS
   ========================================================= */

function openModal(modal) {
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// About Modal
if (aboutButton) aboutButton.addEventListener("click", () => openModal(aboutModal));
if (closeAboutButton) closeAboutButton.addEventListener("click", () => closeModal(aboutModal));
if (closeAboutFooterButton) closeAboutFooterButton.addEventListener("click", () => closeModal(aboutModal));

// Prompt Modal
if (viewPromptButton) {
  viewPromptButton.addEventListener("click", () => {
    buildPromptPreview();
    openModal(promptModal);
  });
}
if (closePromptButton) closePromptButton.addEventListener("click", () => closeModal(promptModal));
if (closePromptFooterButton) closePromptFooterButton.addEventListener("click", () => closeModal(promptModal));

// Copy Prompt Button in Modal
if (copyPromptButton) {
  copyPromptButton.addEventListener("click", async () => {
    const promptText = buildPromptPreview();
    try {
      await navigator.clipboard.writeText(promptText);
      copyPromptButton.textContent = "✅ Copied!";
      setTimeout(() => {
        copyPromptButton.textContent = "📋 Copy Prompt";
      }, 1800);
    } catch {
      copyPromptButton.textContent = "Copy Failed";
      setTimeout(() => {
        copyPromptButton.textContent = "📋 Copy Prompt";
      }, 1800);
    }
  });
}

// Dismiss modals on backdrop click & Escape key
[aboutModal, promptModal].forEach((modal) => {
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal);
    });
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal(aboutModal);
    closeModal(promptModal);
    if (studioSidebar) studioSidebar.classList.remove("open");
  }
});

/* =========================================================
   CHAT & MESSAGE RENDERING
   ========================================================= */

function scrollToLatestMessage() {
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: "smooth",
  });
}

function enhanceCodeBlocks(container) {
  const pres = container.querySelectorAll("pre");
  pres.forEach((pre) => {
    // Check if already enhanced
    if (pre.parentElement.classList.contains("code-container")) return;

    const code = pre.querySelector("code");
    const lang = code ? (code.className.match(/language-(\w+)/) || [])[1] || "code" : "code";

    const wrapper = document.createElement("div");
    wrapper.className = "code-container";

    const header = document.createElement("div");
    header.className = "code-header";
    header.innerHTML = `
      <span>${lang}</span>
      <button class="copy-snippet-btn" type="button">
        📋 Copy
      </button>
    `;

    const copyBtn = header.querySelector(".copy-snippet-btn");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.textContent.trim());
        copyBtn.textContent = "✅ Copied";
        setTimeout(() => (copyBtn.textContent = "📋 Copy"), 1500);
      } catch {
        copyBtn.textContent = "Failed";
        setTimeout(() => (copyBtn.textContent = "📋 Copy"), 1500);
      }
    });

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });
}

function createMessageElement(sender) {
  const row = document.createElement("div");
  row.className = sender === "user" ? "message-row user-row" : "message-row bot-row";

  const avatar = document.createElement("div");
  avatar.className = sender === "user" ? "message-avatar-halo user-avatar" : "message-avatar-halo bot-avatar";
  avatar.textContent = sender === "user" ? "You" : "EA";

  const wrapper = document.createElement("div");
  wrapper.className = "message-bubble-wrapper";

  const bubble = document.createElement("div");
  bubble.className = sender === "user" ? "message-bubble user-bubble" : "message-bubble bot-bubble";

  wrapper.appendChild(bubble);
  row.appendChild(avatar);
  row.appendChild(wrapper);

  return { row, wrapper, bubble };
}

function createResponseActions(wrapper, responseText, responseTime, userPrompt) {
  const bar = document.createElement("div");
  bar.className = "response-actions-bar";

  const latency = document.createElement("div");
  latency.className = "response-latency";
  latency.innerHTML = `<span>⚡</span> <span>${responseTime}s</span>`;

  const btnGroup = document.createElement("div");
  btnGroup.className = "response-button-group";

  const copyBtn = document.createElement("button");
  copyBtn.className = "tool-action-btn";
  copyBtn.type = "button";
  copyBtn.innerHTML = `📋 <span>Copy</span>`;

  const pdfBtn = document.createElement("button");
  pdfBtn.className = "tool-action-btn";
  pdfBtn.type = "button";
  pdfBtn.innerHTML = `📄 <span>PDF</span>`;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(responseText);
      copyBtn.innerHTML = `✅ <span>Copied</span>`;
      setTimeout(() => (copyBtn.innerHTML = `📋 <span>Copy</span>`), 1500);
    } catch {
      copyBtn.innerHTML = `❌ <span>Failed</span>`;
      setTimeout(() => (copyBtn.innerHTML = `📋 <span>Copy</span>`), 1500);
    }
  });

  pdfBtn.addEventListener("click", () => {
    downloadResponseAsPDF(responseText, userPrompt);
  });

  btnGroup.appendChild(copyBtn);
  btnGroup.appendChild(pdfBtn);

  bar.appendChild(latency);
  bar.appendChild(btnGroup);

  wrapper.appendChild(bar);
}

function downloadResponseAsPDF(responseText, userPrompt) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF library is loading. Please try again in a moment.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const selectedRole = getSelectedRoleText();
  const selectedTechnique = getSelectedTechniqueText();
  const generatedDate = new Date().toLocaleString();

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const usableWidth = pageWidth - margin * 2;

  let currentY = 20;

  // Header Banner
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageWidth, 38, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("EduAssist AI • Prompt Engineering Studio", margin, 18);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(148, 163, 184);
  pdf.text(`Persona: ${selectedRole}  |  Technique: ${selectedTechnique}  |  Date: ${generatedDate}`, margin, 28);

  currentY = 48;

  // User Prompt Section
  pdf.setTextColor(15, 23, 42);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("User Query / Prompt:", margin, currentY);
  currentY += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(51, 65, 85);

  const promptLines = pdf.splitTextToSize(userPrompt || lastUserMessage || "N/A", usableWidth);
  promptLines.forEach((line) => {
    if (currentY > pageHeight - 20) {
      pdf.addPage();
      currentY = 20;
    }
    pdf.text(line, margin, currentY);
    currentY += 5;
  });

  currentY += 6;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Response Section
  pdf.setTextColor(15, 23, 42);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("AI Response:", margin, currentY);
  currentY += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(30, 41, 59);

  const cleanResponse = responseText
    .replace(/#{1,6}\s?/g, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/\|/g, " ")
    .replace(/---+/g, "")
    .trim();

  const responseLines = pdf.splitTextToSize(cleanResponse, usableWidth);
  responseLines.forEach((line) => {
    if (currentY > pageHeight - 20) {
      pdf.addPage();
      currentY = 20;
    }
    pdf.text(line, margin, currentY);
    currentY += 5;
  });

  pdf.save("EduAssist-Response.pdf");
}

function addMessage(text, sender, options = {}) {
  const { row, wrapper, bubble } = createMessageElement(sender);

  if (sender === "bot" && typeof marked !== "undefined") {
    bubble.innerHTML = marked.parse(text);
    enhanceCodeBlocks(bubble);
  } else {
    bubble.textContent = text;
  }

  if (sender === "bot" && options.showActions) {
    createResponseActions(wrapper, text, options.responseTime, options.userPrompt);
  }

  chatMessages.appendChild(row);
  scrollToLatestMessage();

  return row;
}

function addNotificationMessage(text) {
  const noticeRow = document.createElement("div");
  noticeRow.className = "message-row bot-row";
  noticeRow.style.margin = "4px 0";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble bot-bubble";
  bubble.style.padding = "8px 14px";
  bubble.style.fontSize = "0.82rem";
  bubble.style.background = "rgba(99, 102, 241, 0.12)";
  bubble.style.border = "1px solid rgba(99, 102, 241, 0.3)";
  bubble.style.color = "#c7d2fe";

  if (typeof marked !== "undefined") {
    bubble.innerHTML = marked.parse(text);
  } else {
    bubble.textContent = text;
  }

  noticeRow.appendChild(bubble);
  chatMessages.appendChild(noticeRow);
  scrollToLatestMessage();
}

function addTypingIndicator() {
  const { row, bubble } = createMessageElement("bot");
  bubble.className = "typing-bubble";
  bubble.innerHTML = `
    <span>✨ EduAssist is generating</span>
    <div class="typing-pulse-dots">
      <span></span><span></span><span></span>
    </div>
  `;

  chatMessages.appendChild(row);
  scrollToLatestMessage();
  return row;
}

function resetInputHeight() {
  userInput.style.height = "auto";
}

function setChatControlsDisabled(isDisabled) {
  sendButton.disabled = isDisabled;
  userInput.disabled = isDisabled;
}

/* =========================================================
   SEND MESSAGE HANDLER
   ========================================================= */

async function sendMessage(message) {
  lastUserMessage = message;

  const selectedRole = getSelectedRole();
  const selectedTechnique = getSelectedTechnique();

  addMessage(message, "user");

  userInput.value = "";
  resetInputHeight();
  setChatControlsDisabled(true);

  const typingRow = addTypingIndicator();
  const startTime = performance.now();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        role: selectedRole,
        technique: selectedTechnique,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Server returned an invalid response.");
    }

    typingRow.remove();

    if (!response.ok) {
      throw new Error(data.message || "Failed to generate response.");
    }

    if (!data.reply) {
      throw new Error("Gemini returned an empty response.");
    }

    const endTime = performance.now();
    const responseTime = ((endTime - startTime) / 1000).toFixed(2);

    addMessage(data.reply, "bot", {
      showActions: true,
      responseTime,
      userPrompt: message,
    });
  } catch (error) {
    if (typingRow.isConnected) {
      typingRow.remove();
    }

    addMessage(
      `⚠️ **Error**: ${error.message || "Something went wrong. Please try again."}`,
      "bot"
    );
  } finally {
    setChatControlsDisabled(false);
    userInput.focus();
  }
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

// Form Submission
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) {
    userInput.focus();
    return;
  }
  sendMessage(message);
});

// Keydown (Enter to send, Shift+Enter for newline)
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

// Auto-expand Textarea
userInput.addEventListener("input", () => {
  resetInputHeight();
  userInput.style.height = `${Math.min(userInput.scrollHeight, 140)}px`;
});

// Suggestion Prompts / Starter Chips
suggestionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.textContent.trim();
    userInput.value = text;
    resetInputHeight();
    userInput.style.height = `${Math.min(userInput.scrollHeight, 140)}px`;
    userInput.focus();
  });
});

// Clear Conversation
clearButton.addEventListener("click", () => {
  const confirmed = window.confirm("Are you sure you want to clear this workspace conversation?");
  if (!confirmed) return;

  chatMessages.innerHTML = `
    <div class="message-row bot-row">
      <div class="message-avatar-halo bot-avatar"><span>EA</span></div>
      <div class="message-bubble-wrapper">
        <div class="message-bubble bot-bubble">
          Workspace cleared! Select a role & strategy, then type your question below.
        </div>
      </div>
    </div>
  `;
  lastUserMessage = "";
  userInput.value = "";
  resetInputHeight();
  userInput.focus();
});

// Initial Setup
updateTechniqueInformation();
updateConfigurationPanel();
userInput.focus();
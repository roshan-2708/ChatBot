/* =========================================================
   EDUASSIST AI — CLIENT SCRIPT (CHATGPT-STYLE)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatMessages = document.getElementById("chatMessages");
  const sendButton = document.getElementById("sendButton");
  const clearButton = document.getElementById("clearButton");
  const welcomeView = document.getElementById("welcomeView");
  const suggestionButtons = document.querySelectorAll(".suggestion-button");

  // Auto-resize textarea and toggle send button state
  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = `${Math.min(userInput.scrollHeight, 180)}px`;
    
    if (sendButton) {
      sendButton.disabled = !userInput.value.trim();
    }
  });

  // Handle Enter key (send) and Shift+Enter (newline)
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (userInput.value.trim() && !sendButton.disabled) {
        chatForm.requestSubmit();
      }
    }
  });

  // Handle suggestion cards
  suggestionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const desc = btn.querySelector(".card-desc")?.textContent || btn.textContent.trim();
      if (desc) {
        userInput.value = desc;
        userInput.dispatchEvent(new Event("input"));
        userInput.focus();
        chatForm.requestSubmit();
      }
    });
  });

  // Handle New Chat (Clear)
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      chatMessages.innerHTML = "";
      if (welcomeView) {
        chatMessages.appendChild(welcomeView);
      }
      userInput.value = "";
      userInput.style.height = "auto";
      if (sendButton) sendButton.disabled = true;
      userInput.focus();
    });
  }

  // Handle Form Submit
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    // Hide welcome view if present
    const currentWelcome = document.getElementById("welcomeView");
    if (currentWelcome) {
      currentWelcome.remove();
    }

    // Append User Message
    appendUserMessage(message);

    // Reset input
    userInput.value = "";
    userInput.style.height = "auto";
    if (sendButton) sendButton.disabled = true;

    // Append Loading indicator
    const loadingRow = appendLoadingIndicator();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      loadingRow.remove();

      if (response.ok && data.success) {
        appendBotMessage(data.reply);
      } else {
        const errorMsg = data.message || "An error occurred while connecting to EduAssist.";
        appendBotMessage(`⚠️ **Error:** ${errorMsg}`);
      }
    } catch (error) {
      console.error("Chat error:", error);
      loadingRow.remove();
      appendBotMessage("⚠️ **Error:** Unable to reach the server. Please check your connection and try again.");
    }
  });

  // Append User Message to UI
  function appendUserMessage(text) {
    const row = document.createElement("div");
    row.className = "message-row user-row";

    const content = document.createElement("div");
    content.className = "message-content";
    content.textContent = text;

    row.appendChild(content);
    chatMessages.appendChild(row);
    scrollToBottom();
  }

  // Append Bot Message to UI
  function appendBotMessage(markdownText) {
    const row = document.createElement("div");
    row.className = "message-row bot-row";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar bot-avatar";
    avatar.textContent = "EA";

    const content = document.createElement("div");
    content.className = "message-content";

    // Format markdown using marked if available
    if (typeof marked !== "undefined" && marked.parse) {
      content.innerHTML = marked.parse(markdownText);
    } else {
      content.textContent = markdownText;
    }

    // Add copy button to code blocks
    content.querySelectorAll("pre").forEach((pre) => {
      const code = pre.querySelector("code");
      const text = code ? code.innerText : pre.innerText;

      const header = document.createElement("div");
      header.className = "code-header";
      header.innerHTML = `
        <span>code</span>
        <button class="copy-btn" type="button">Copy code</button>
      `;

      header.querySelector(".copy-btn").addEventListener("click", () => {
        navigator.clipboard.writeText(text).then(() => {
          const btn = header.querySelector(".copy-btn");
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = "Copy code"), 2000);
        });
      });

      pre.parentNode.insertBefore(header, pre);
    });

    row.appendChild(avatar);
    row.appendChild(content);
    chatMessages.appendChild(row);
    scrollToBottom();
  }

  // Append Loading Indicator
  function appendLoadingIndicator() {
    const row = document.createElement("div");
    row.className = "message-row bot-row loading-row";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar bot-avatar";
    avatar.textContent = "EA";

    const content = document.createElement("div");
    content.className = "message-content";
    content.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;

    row.appendChild(avatar);
    row.appendChild(content);
    chatMessages.appendChild(row);
    scrollToBottom();
    return row;
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
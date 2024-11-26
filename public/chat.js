const participantID = localStorage.getItem("participantID");
let conversationHistory = [];
const inputField = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const messagesContainer = document.getElementById("messages");
chatForm.addEventListener("submit", sendMessage);

async function sendMessage(event) {
  event.preventDefault();

  const userInput = inputField.value.trim();

  if (userInput === "") {
    alert("Please enter a message!");
    return;
  }

  // Create and display the user's message div
  const userMessageDiv = document.createElement("div");
  userMessageDiv.classList.add("message", "user-message");
  userMessageDiv.textContent = `You: ${userInput}`;
  messagesContainer.appendChild(userMessageDiv);

  // Clear the input field after sending the message
  inputField.value = "";

  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  console.log("User:", userInput);

  try {
    // ternary operator to check for conversation history
    const payload =
      conversationHistory.length === 0
        ? { input: userInput, participantID } // First submission, send only input
        : { history: conversationHistory, input: userInput, participantID };

    const response = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Add user input and bot response to the conversation history
    conversationHistory.push({ role: "user", content: userInput });
    conversationHistory.push({ role: "assistant", content: data.botResponse });

    // Create and display the bot's message div
    const botMessageDiv = document.createElement("div");
    botMessageDiv.classList.add("message", "bot-message");

    // Use innerHTML to render the HTML-formatted response
    botMessageDiv.innerHTML = `Bot: ${data.botResponse}`;
    messagesContainer.appendChild(botMessageDiv);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to fetch and load existing conversation history
async function loadConversationHistory() {
  const response = await fetch("/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantID }),
  });

  const data = await response.json();
  if (data.interactions && data.interactions.length > 0) {
    data.interactions.forEach((interaction) => {
      const userMessageDiv = document.createElement("div");
      userMessageDiv.classList.add("message", "user-message");
      userMessageDiv.textContent = `You: ${interaction.userInput}`;
      messagesContainer.appendChild(userMessageDiv);

      const botMessageDiv = document.createElement("div");
      botMessageDiv.classList.add("message", "bot-message");

      // Convert botResponse from Markdown to HTML and use innerHTML to render it
      botMessageDiv.innerHTML = `Bot: ${marked.parse(interaction.botResponse)}`;
      messagesContainer.appendChild(botMessageDiv);

      conversationHistory.push({ role: "user", content: interaction.userInput });
      conversationHistory.push({ role: "assistant", content: interaction.botResponse });
    });

    // Scroll to the bottom of the chat
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Load history when agent loads
window.onload = loadConversationHistory;

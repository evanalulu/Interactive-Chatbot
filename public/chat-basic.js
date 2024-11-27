// Get references to input field, form, and messages container
const inputField = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const messagesContainer = document.getElementById("messages");

// Add an event listener to the chat form to trigger sendMessage() when submitted
chatForm.addEventListener("submit", sendMessage);

async function sendMessage(event) {
  event.preventDefault();

  const userInput = inputField.value.trim();
  const participantID = localStorage.getItem("participantID");

  if (userInput === "") {
    alert("Please enter a message!");
    return;
  }

  if (!participantID) {
    alert("Participant ID is missing. Please enter your participant ID.");
    return;
  }

  // Display the user's message in the chat window
  const userMessage = document.createElement("div");
  userMessage.classList.add("message", "user-message");
  userMessage.textContent = `You: ${userInput}`;
  messagesContainer.appendChild(userMessage);

  inputField.value = "";

  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const response = await fetch("/submit-basic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantID: participantID, // Include participant ID in request
        userInput: userInput, // Use 'userInput' key as expected by server
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error from server: ${errorText}`);
    }

    const data = await response.json();

    // Display the bot's response in the chat window
    const botMessage = document.createElement("div");
    botMessage.classList.add("message", "bot-message");
    botMessage.textContent = `Bot: ${data.botResponse}`;
    messagesContainer.appendChild(botMessage);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    console.error("Error:", error);
  }
}

// LOGGING
document.getElementById("send-btn").addEventListener("click", () => {
  logEvent("click", "Send Button");
});
document.getElementById("chat-container").addEventListener("mouseover", () => {
  logEvent("hover", "User Input");
});

document.getElementById("chat-container").addEventListener("focus", () => {
  logEvent("focus", "User Input");
});

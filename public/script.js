// Get references to input field, form, and messages container
const inputField = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const messagesContainer = document.getElementById("messages");

// Add an event listener to the chat form to trigger sendMessage() when submitted
chatForm.addEventListener("submit", sendMessage);

async function sendMessage(event) {
  event.preventDefault();
  
  const userInput = inputField.value.trim();

  if (userInput === "") {
    alert("Please enter a message!");
    return;
  }

  // Display the user's message in the chat window
  const userMessage = document.createElement("div");
  userMessage.classList.add("message", "user-message");
  userMessage.textContent = `You: ${userInput}`;
  messagesContainer.appendChild(userMessage);

  // Clear the input field after sending the message
  inputField.value = "";

  console.log("User:", userInput);

  try {
    const response = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput })  // Send the message as JSON
    });

    const data = await response.json();

    // Display the bot's response in the chat window
    const botMessage = document.createElement("div");
    botMessage.classList.add("message", "bot-message");
    
    botMessage.textContent = `Bot: ${data.botResponse}`; 
    messagesContainer.appendChild(botMessage);

  } catch (error) {
    console.error("Error:", error);
  }
}
// Log click events on the "Submit" button
document.getElementById('submit').addEventListener('click', () => {
  logEvent('click', 'Send Button');
});

// Log hover and focus events on the input field
document.getElementById('chat-container').addEventListener('mouseover', () => {
  logEvent('hover', 'User Input');
});

document.getElementById('chat-container').addEventListener('focus', () => {
  logEvent('focus', 'User Input');
});

// Function to log events to the server
function logEvent(type, element) {
  fetch('/log-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventType: type, elementName: element, timestamp: new Date() })
  });
}  
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

  //Display the user's message in the chat window
  messagesContainer.innerHTML += `<div class="message user-message">You: ${userInput}</div>`;

  // Clear the input field after sending the message
  inputField.value = "";

  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  console.log("User:", userInput);

  try {
    const response = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput })  // Send the message as JSON
    });

    const data = await response.json();

    // Display the bot's response in the chat window
    messagesContainer.innerHTML += `<div class="message bot-message">Bot: ${data.botResponse}</div>`;

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

  } catch (error) {
    console.error("Error:", error);
  }
}
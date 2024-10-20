// Log click events on the "Submit" button
document.getElementById('submit').addEventListener('click', () => {
  // logEvent('click', 'Send Button');
});

// Log hover and focus events on the input field
document.getElementById('chat-container').addEventListener('mouseover', () => {
  // logEvent('hover', 'User Input');
});

document.getElementById('chat-container').addEventListener('focus', () => {
  // logEvent('focus', 'User Input');
});

// Function to log events to the server
function logEvent(type, element) {
  fetch('/log-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventType: type, elementName: element, timestamp: new Date() })
  });
}

// Retrieve participantID from localStorage
const participantID = localStorage.getItem('participantID');
// Alert and prompt if no participantID
if (!participantID) {
  alert('Please enter a participant ID.');
  // Redirect to login if no participantID is set
  window.location.href = '/';
}


// Get references to input field, form, and messages container
const inputField = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const messagesContainer = document.getElementById("messages");

// Add an event listener to the chat form to trigger sendMessage() when submitted
chatForm.addEventListener("submit", sendMessage);

let conversationHistory = [];

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
    // ternary operator to check for conversation history
    const payload = conversationHistory.length === 0
    ? { input: userInput, participantID } // First submission, send only input
    : { history: conversationHistory, input: userInput, participantID };
    
    const response = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // add user input and bot response to the conversation history
    conversationHistory.push({ role: 'user', content: userInput });
    conversationHistory.push({ role: 'assistant', content: data.botResponse});

    // Display the bot's response in the chat window
    messagesContainer.innerHTML += `<div class="message bot-message">Bot: ${data.botResponse}</div>`;

    messagesContainer.innerHTML += `<div class="message bot-message">Bing Search:</div>`;
    if (data.searchResults && data.searchResults.length > 0) {
      const searchResultsDiv = document.createElement('div');
      data.searchResults.forEach(result => {
        const resultDiv = document.createElement('div');
        resultDiv.innerHTML = `<a href="${result.url}"
        target="_blank">${result.title}</a><p>${result.snippet}</p>`;
        searchResultsDiv.appendChild(resultDiv);
      });
      document.getElementById('messages').appendChild(searchResultsDiv);
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to fetch and load existing conversation history
async function loadConversationHistory() {
  const response = await fetch('/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantID }) // Send participantID to the server
  });

  const data = await response.json();
  if (data.interactions && data.interactions.length > 0) {
    data.interactions.forEach(interaction => {
      const userMessageDiv = document.createElement('div');
      userMessageDiv.textContent = `You: ${interaction.userInput}`;
      document.getElementById('messages').appendChild(userMessageDiv);
      const botMessageDiv = document.createElement('div');
      botMessageDiv.textContent = `Bot: ${interaction.botResponse}`;
      document.getElementById('messages').appendChild(botMessageDiv);
      // Add to conversation history
      conversationHistory.push({ role: 'user', content: interaction.userInput });
      conversationHistory.push({ role: 'assistant', content: interaction.botResponse });
    });
  }
}
// Load history when agent loads
window.onload = loadConversationHistory;
  
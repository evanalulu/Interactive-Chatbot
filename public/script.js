// Log click events on the "Submit" button
document.getElementById("submit").addEventListener("click", () => {
  // logEvent('click', 'Send Button');
});

// Log hover and focus events on the input field
document.getElementById("chat-container").addEventListener("mouseover", () => {
  // logEvent('hover', 'User Input');
});

document.getElementById("chat-container").addEventListener("focus", () => {
  // logEvent('focus', 'User Input');
});

// Function to log events to the server
function logEvent(type, element) {
  fetch("/log-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType: type, elementName: element, timestamp: new Date() }),
  });
}

function submitSettings() {
  const topics = Array.from(document.querySelectorAll('input[name="topic"]:checked')).map((input) => input.value);
  const questionTypes = Array.from(document.querySelectorAll('input[name="question-type"]:checked')).map(
    (input) => input.value
  );
  const difficulty = document.getElementById("difficulty").value;

  const participantID = "exampleParticipantID"; // Replace this with the actual participant ID
  const history = []; // Replace with actual history if you're maintaining it

  const data = {
    participantID: participantID,
    topics: topics,
    questionTypes: questionTypes,
    difficulty: difficulty,
    history: history,
  };

  console.log("Data to send:", data); // Log the data object for verification

  fetch("/generate-question", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      displayQuestion(data.question);
      console.log("Generated Question:", data.question);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function displayQuestion(questionText) {
  // Split the response into sections based on "---"
  const sections = questionText.split("---");

  const questionSection = sections[0].trim();
  const answerSection = sections[1]?.replace("Correct Answer:", "").trim();
  const explanationSection = sections[2]?.replace("Brief Explanation:", "").trim();

  const questionLines = questionSection.split("\n");
  const question = questionLines[0].replace("**Question:** ", "").trim();
  const choices = questionLines.slice(1).filter((line) => line);

  document.querySelector("#question-area p").textContent = question;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = ""; // Clear previous choices

  choices.forEach((choice) => {
    const choiceDiv = document.createElement("div");
    choiceDiv.textContent = choice.trim();
    answersDiv.appendChild(choiceDiv);
  });

  document.getElementById("question-area").dataset.correctAnswer = answerSection;
  document.getElementById("question-area").dataset.explanation = explanationSection;

  const answerButtons = document.querySelectorAll("#answer-buttons button");
  answerButtons.forEach((button, index) => {
    button.onclick = () => checkAnswer(choices[index], answerSection, explanationSection);
  });
}

function checkAnswer(selectedChoice, correctAnswer, explanation) {
  const isCorrect = selectedChoice.startsWith(correctAnswer); // Check if selected choice matches the correct answer

  if (isCorrect) {
    alert("Correct! 🎉");
  } else {
    alert("Incorrect. 😞");
  }

  // Display explanation regardless of correctness
  const explanationDiv = document.createElement("div");
  explanationDiv.textContent = `Explanation: ${explanation}`;
  document.getElementById("question-area").appendChild(explanationDiv);
}

// Retrieve participantID from localStorage
const participantID = localStorage.getItem("participantID");
console.log(participantID);

// Alert and prompt if no participantID
if (!participantID) {
  alert("Please enter a participant ID.");
  // Redirect to login if no participantID is set
  window.location.href = "/";
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
    botMessageDiv.textContent = `Bot: ${data.botResponse}`;
    messagesContainer.appendChild(botMessageDiv);

    // Create and display Bing search results if available
    // Create and display Bing search results if available
    if (data.searchResults && data.searchResults.length > 0) {
      // Clear previous search results
      const searchSection = document.getElementById("search-section");
      searchSection.innerHTML = ""; // Clear any previous results

      const searchResultsHeader = document.createElement("h3");
      searchResultsHeader.textContent = "Bing Search Results:";
      searchSection.appendChild(searchResultsHeader);

      // Display the search results
      data.searchResults.forEach((result) => {
        const resultDiv = document.createElement("div");
        resultDiv.classList.add("search-result");
        resultDiv.innerHTML = `<a href="${result.url}" target="_blank">${result.title}</a><p>${result.snippet}</p>`;
        searchSection.appendChild(resultDiv);
      });
    }

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
    body: JSON.stringify({ participantID }), // Send participantID to the server
  });

  const data = await response.json();
  if (data.interactions && data.interactions.length > 0) {
    data.interactions.forEach((interaction) => {
      // Create and display the user's message div from history
      const userMessageDiv = document.createElement("div");
      userMessageDiv.classList.add("message", "user-message");
      userMessageDiv.textContent = `You: ${interaction.userInput}`;
      messagesContainer.appendChild(userMessageDiv);

      // Create and display the bot's message div from history
      const botMessageDiv = document.createElement("div");
      botMessageDiv.classList.add("message", "bot-message");
      botMessageDiv.textContent = `Bot: ${interaction.botResponse}`;
      messagesContainer.appendChild(botMessageDiv);

      // Add to conversation history
      conversationHistory.push({ role: "user", content: interaction.userInput });
      conversationHistory.push({ role: "assistant", content: interaction.botResponse });
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Load history when agent loads
window.onload = loadConversationHistory;

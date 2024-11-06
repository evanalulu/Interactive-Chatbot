// Retrieve participantID from localStorage
const participantID = localStorage.getItem("participantID");
if (!participantID) {
  alert("Please enter a participant ID.");
  window.location.href = "/";
}

let conversationHistory = [];
const inputField = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const messagesContainer = document.getElementById("messages");
chatForm.addEventListener("submit", sendMessage);

document.getElementById("submit").addEventListener("click", () => {
  // logEvent('click', 'Send Button');
});

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

async function startQuizProcess() {
  // Get the last 10 interactions from the conversation history
  const recentInteractions = conversationHistory.slice(-10);

  // Extract topics from recent interactions and then submit settings
  await extractTopicsFromHistory(recentInteractions);
}

// Extracting relevant topics from recent interactions
document.getElementById("start-quiz-button").addEventListener("click", startQuizProcess);

async function extractTopicsFromHistory(interactions) {
  try {
    const response = await fetch("/extract-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interactions }),
    });

    const data = await response.json();
    console.log("Extracted Topics:", data.topics);

    const topics = Array.isArray(data.topics) ? data.topics : [];
    submitSettings(topics);
  } catch (error) {
    console.error("Error extracting topics:", error);
    return [];
  }
}

function submitSettings(extractedTopics) {
  // Remove start quiz button from screen
  document.getElementById("start-quiz-button").style.display = "none";

  const selectedTopics = Array.from(document.querySelectorAll('input[name="topic"]:checked')).map(
    (input) => input.value
  );
  const questionTypes = Array.from(document.querySelectorAll('input[name="question-type"]:checked')).map(
    (input) => input.value
  );
  const difficulty = document.getElementById("difficulty").value;

  const combinedTopics = [...new Set([...selectedTopics, ...extractedTopics])];
  console.log("Combined topics: " + combinedTopics);

  const data = {
    participantID: participantID,
    topics: combinedTopics,
    questionTypes: questionTypes,
    difficulty: difficulty,
  };

  console.log("Data to send:", data);

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

  const questionElement = document.querySelector("#question-area p");
  questionElement.textContent = question;

  // Clear previous q/a
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  choices.forEach((choice) => {
    const choiceButton = document.createElement("button");
    choiceButton.textContent = choice.trim();
    choiceButton.classList.add("choice-button");
    choiceButton.onclick = () => checkAnswer(choice, answerSection, explanationSection);
    answersDiv.appendChild(choiceButton);
  });
}

function checkAnswer(selectedChoice, correctAnswer, explanation) {
  const isCorrect = selectedChoice.startsWith(correctAnswer);

  const feedbackText = document.getElementById("feedback-text");
  const feedbackExplanation = document.getElementById("feedback-explanation");

  feedbackText.textContent = isCorrect ? "Correct! 🎉" : "Incorrect. 😞";
  feedbackExplanation.textContent = `Explanation: ${explanation}`;

  document.getElementById("feedback").style.display = "block";
  document.getElementById("next-question-button").style.display = "block";
}

function loadNextQuestion() {
  document.querySelector("#question-area p").textContent = "";
  document.getElementById("feedback").style.display = "none";
  document.getElementById("next-question-button").style.display = "none";
  document.getElementById("answers").innerHTML = "";

  startQuizProcess();
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

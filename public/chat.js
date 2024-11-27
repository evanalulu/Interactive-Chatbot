const participantID = localStorage.getItem("participantID");
let conversationHistory = [];
let parsedPDFText = "";
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
    // Prepare the payload for API request
    const payload = {
      input: userInput,
      participantID: participantID,
      history: conversationHistory.length > 0 ? conversationHistory : undefined,
      syllabusText: parsedPDFText.trim() ? parsedPDFText : undefined,
    };

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
      botMessageDiv.innerHTML = `Bot: ${marked.parse(interaction.botResponse)}`;
      messagesContainer.appendChild(botMessageDiv);

      conversationHistory.push({ role: "user", content: interaction.userInput });
      conversationHistory.push({ role: "assistant", content: interaction.botResponse });
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Load history when agent loads
window.onload = loadConversationHistory;

/* --------- SYLLABUS UPLOAD PARSING ----------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("syllabus-upload").addEventListener("change", function () {
    const file = this.files[0];

    if (file && file.type === "application/pdf") {
      const fileReader = new FileReader();
      fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);

        if (typeof pdfjsLib !== "undefined") {
          pdfjsLib
            .getDocument(typedarray)
            .promise.then((pdf) => {
              let totalText = "";

              // Loop through all pages
              const numPages = pdf.numPages;
              let pagesProcessed = 0;

              for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
                pdf.getPage(pageNumber).then((page) => {
                  page.getTextContent().then((textContent) => {
                    let pageText = "";
                    textContent.items.forEach((item) => {
                      pageText += item.str + " ";
                    });
                    totalText += pageText + "\n";
                    pagesProcessed++;

                    // All pages processed
                    if (pagesProcessed === numPages) {
                      parsedPDFText = totalText.trim();
                      // Hard-code the message: "I've uploaded my syllabus"
                      sendSyllabus("I've uploaded my syllabus", parsedPDFText);
                    }
                  });
                });
              }
            })
            .catch((err) => {
              console.error("Error parsing PDF: ", err);
            });
        } else {
          console.error("pdfjsLib is not defined");
        }
      };

      fileReader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  });
});

function sendSyllabus(userMessage, syllabusText) {
  const userMessageDiv = document.createElement("div");
  userMessageDiv.classList.add("message", "user-message");
  userMessageDiv.textContent = `You: ${userMessage}`;
  messagesContainer.appendChild(userMessageDiv);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  const payload =
    conversationHistory.length === 0
      ? { input: userMessage, participantID, syllabus: syllabusText }
      : { history: conversationHistory, input: userMessage, participantID, syllabus: syllabusText };

  // Send message to API
  fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      conversationHistory.push({ role: "user", content: userMessage });
      conversationHistory.push({ role: "assistant", content: data.botResponse });

      const botMessageDiv = document.createElement("div");
      botMessageDiv.classList.add("message", "bot-message");
      botMessageDiv.innerHTML = `Bot: ${data.botResponse}`;
      messagesContainer.appendChild(botMessageDiv);

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

/* --------- LOGGING ----------- */
document.addEventListener("DOMContentLoaded", () => {
  const participantID = localStorage.getItem("participantID");

  if (!participantID) {
    console.error("Participant ID is not set in localStorage");
    return;
  }

  console.log("Participant ID:", participantID);

  // Logging send button click
  document.getElementById("submit").addEventListener("click", () => {
    logEvent("click", "Send Button");
  });

  // Logging when a user hovers over the chat container
  document.getElementById("chat-container").addEventListener("mouseover", () => {
    logEvent("hover", "Chat Container");
  });

  // Logging syllabus upload
  document.getElementById("syllabus-upload").addEventListener("change", function () {
    if (this.files && this.files[0]) {
      logEvent("file-upload", "Syllabus Upload");
    }
  });

  // Logging start quiz button click
  document.getElementById("start-quiz-button").addEventListener("click", () => {
    logEvent("click", "Start Quiz Button");
  });

  // Logging "Choose File" button click
  document.getElementById("custom-file-upload").addEventListener("click", () => {
    logEvent("click", "Choose File Button");
  });

  // Logging next question button click
  document.getElementById("next-question-button").addEventListener("click", () => {
    logEvent("click", "Next Question Button");
  });

  // Logging topic selection
  document.querySelectorAll('input[name="topic"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      logEvent("change", `Topic Checkbox - ${checkbox.value}`);
    });
  });

  // Logging question type selection
  document.querySelectorAll('input[name="question-type"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      logEvent("change", `Question Type Checkbox - ${checkbox.value}`);
    });
  });

  // Logging difficulty selection
  document.getElementById("difficulty").addEventListener("change", () => {
    logEvent("change", "Difficulty Selection");
  });

  // Logging quiz settings submission
  document.getElementById("submit-settings").addEventListener("click", () => {
    logEvent("click", "Submit Quiz Settings Button");
  });

  // Function to log events to the server
  function logEvent(type, element) {
    console.log(participantID, type, element); // Log to console for local debugging
    fetch("/log-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: type,
        elementName: element,
        timestamp: new Date(),
        participantID: participantID,
      }),
    }).catch((error) => {
      console.error("Error logging event:", error);
    });
  }
});

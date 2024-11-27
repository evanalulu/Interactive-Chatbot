const participantID = localStorage.getItem("participantID");

// Function to log events to the server
function logEvent(type, element) {
  console.log("participantID: ", participantID);

  fetch("/log-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: type,
      elementName: element,
      timestamp: new Date(),
      participantID: participantID,
    }),
  });
}

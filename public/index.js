document.getElementById("participant-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const participantID = document.getElementById("participantID").value;
  localStorage.setItem("participantID", participantID);

  if (!participantID) {
    alert("Please enter a participant ID.");
    return;
  }

  // Save the Participant ID in localStorage
  localStorage.setItem("participantID", participantID);
  if (parseInt(participantID.slice(-1)) % 2 === 0) {
    window.location.href = "chat.html";
  } else {
    window.location.href = "chat-basic.html";
  }
});

document.getElementById("participant-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const participantID = document.getElementById("participantID").value;
  localStorage.setItem("participantID", participantID);

  if (!participantID) {
    alert("Please enter a participant ID.");
    return;
  }

  window.location.href = "flow.html";
});

const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle POST requests to /submit
app.post('/submit', (req, res) => {
  const userMessage = req.body.message;

  console.log(`User message received: ${userMessage}`);

  // Respond with JSON
  res.json({
    userMessage: userMessage,
    response: 'Message Received!'
  });
});

app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

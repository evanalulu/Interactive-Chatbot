const express = require('express');
const path = require('path');

const app = express();

require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle POST requests to /submit
app.post('/submit', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  console.log(`User message received: ${userMessage}`);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 500,
    });

    const botResponse = response.choices[0].message.content.trim();
    res.json({ botResponse });  // Send a JSON success response
    
  } catch (error) {
    console.error('Error with OpenAI API: ', error.message);
    res.status(500).json({ error: 'Server Error' });  // Send JSON error response for server issues
  }

});

app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

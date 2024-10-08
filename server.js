const express = require('express');
const path = require('path');
const { OpenAI } = require('openai');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:',
err));

const Interaction = require('./models/Interaction'); // Import Interaction model

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/chatbot', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chatbot.html'));
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

    // Log the interaction to MongoDB after botResponse is generated
    const interaction = new Interaction({
      userInput: userMessage,
      botResponse: botResponse,
    });
    await interaction.save(); // Save the interaction to MongoDB

    res.json({ botResponse });  // Send a JSON success response
    
  } catch (error) {
    console.error('Error with OpenAI API: ', error.message);
    res.status(500).json({ error: 'Server Error' });  // Send JSON error response for server issues
  }

});

const EventLog = require('./models/EventLog'); // Import EventLog model

app.post('/log-event', async (req, res) => {
  const { eventType, elementName, timestamp } = req.body;

  try {
    // Log the event to MongoDB
    const event = new EventLog({ eventType, elementName, timestamp
    }); await event.save();
    res.status(200).send('Event logged successfully');
  } catch (error) {
    console.error('Error logging event:', error.message);
    res.status(500).send('Server Error');
  }
});

app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

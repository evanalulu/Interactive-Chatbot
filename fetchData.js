/* fetchData.js - run nide fetchData.js to quickly view all interactions and event logs */
const mongoose = require('mongoose');
require('dotenv').config();

const Interaction = require('./models/Interaction');
const EventLog = require('./models/EventLog');

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:',
err));

// Fetch all interactions
async function fetchInteractions() {
  try {
    const interactions = await Interaction.find();
    console.log('Interactions:');
    interactions.forEach(interaction => {
      console.log(`User Input: ${interaction.userInput}`);
      console.log(`Bot Response: ${interaction.botResponse}`);
      console.log('•*´¨`*•.¸¸.•*´¨`*•.¸¸.•*´¨`*•.¸¸.•*');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Fetch all event logs
async function fetchEventLogs() {
  try {
    const eventLogs = await EventLog.find();
    console.log('Event Logs:');
    eventLogs.forEach(event => {
      console.log(`Event Type: ${event.eventType}`);
      console.log(`Element Name: ${event.elementName}`);
      console.log(`Timestamp: ${event.timestamp}`);
      console.log('•*´¨`*•.¸¸.•*´¨`*•.¸¸.•*´¨`*•.¸¸.•*');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

async function fetchData() {
  await fetchInteractions();
  await fetchEventLogs();
}

fetchData();

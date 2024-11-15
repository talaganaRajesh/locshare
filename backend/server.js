const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 5000;

// Use environment variable for MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/locationApp';

app.use(cors({
  origin: "https://locshare-2.onrender.com",
  methods: ["POST", "GET", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB with error handling
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`Server running on https://locshare-1.onrender.com/`);
});

const wss = new WebSocket.Server({ server });

const Location = require('./models/Location');

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Handle incoming messages
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // Broadcast the message to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Endpoint to save a user's location
app.post('/api/location', async (req, res) => {
  const { userId, latitude, longitude, message } = req.body;
  try {
    const location = new Location({ userId, latitude, longitude, message });
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: "Could not save location" });
  }
});

// Endpoint to retrieve all locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: "Could not retrieve locations" });
  }
});

// Endpoint to delete a user's location
app.delete('/api/location', async (req, res) => {
  const { userId } = req.body; // Expecting userId in the request body
  try {
    await Location.deleteMany({ userId }); // Delete all locations for the user
    res.status(200).json({ message: "Location data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Could not delete location" });
  }
});

// Handle preflight requests for API routes
app.options('/api/location', cors());
app.options('/api/locations', cors());


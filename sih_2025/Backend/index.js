
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import the Mongoose models from your schemas.js file
// Make sure this file is in the same directory as your server.js
const { Individual, Team } = require('../Models/SIHSCHEMA.js'); 

// --- Basic Setup ---
const app = express();
const PORT = 8000; // The port your frontend will call

// --- Middleware ---
// Enable Cross-Origin Resource Sharing to allow your React app to communicate with this server
app.use(cors());
// Enable the Express app to parse JSON formatted request bodies
app.use(express.json());

// --- MongoDB Connection ---
// IMPORTANT: Replace this with your actual MongoDB connection string from your cluster
const MONGO_URI = 'mongodb+srv://Gautam:jaiswani@imcoolthanyou.ovv6hm0.mongodb.net/?retryWrites=true&w=majority&appName=imcoolthanyou';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB.'))
    .catch(err => console.error('MongoDB connection error:', err));


// --- API Endpoints ---

/**
 * @route   POST /api/register/individual
 * @desc    Register a new individual participant
 * @access  Public
 */
app.post('/api/register/individual', async (req, res) => {
    try {
        const individualData = req.body;

        // Create a new document using the Individual model
        const newIndividual = new Individual(individualData);

        // Save the new document to the database
        await newIndividual.save();

        // Send a success response back to the frontend with the saved data
        res.status(201).json(newIndividual);

    } catch (error) {
        console.error('Error during individual registration:', error);
        // Send an error response if something goes wrong
        res.status(400).json({ message: 'Registration failed. Please check your data.', error: error.message });
    }
});


/**
 * @route   POST /api/register/team
 * @desc    Register a new team
 * @access  Public
 */
app.post('/api/register/team', async (req, res) => {
    try {
        const teamData = req.body;

        // Clean up the data: Filter out any member slots that were left empty
        teamData.members = teamData.members.filter(member => member.name && member.name.trim() !== '');

        // Create a new document using the Team model
        const newTeam = new Team(teamData);

        // Save the new team to the database
        await newTeam.save();

        // Send a success response
        res.status(201).json(newTeam);

    } catch (error) {
        console.error('Error during team registration:', error);

        // A specific check for duplicate team names, since 'unique' is true in the schema
        if (error.code === 11000) {
            return res.status(409).json({ message: 'This team name is already taken. Please choose another.' });
        }

        // General error response
        res.status(400).json({ message: 'Team registration failed. Please check your data.', error: error.message });
    }
});

/**
 * @route   GET /api/individuals
 * @desc    Get all registered individuals
 * @access  Public
 */
app.get('/api/individuals', async (req, res) => {
    try {
        const individuals = await Individual.find().sort({ registeredAt: -1 }); // Sort by newest first
        res.status(200).json(individuals);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch individuals', error: error.message });
    }
});

/**
 * @route   GET /api/teams
 * @desc    Get all registered teams
 * @access  Public
 */
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find().sort({ registeredAt: -1 }); // Sort by newest first
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch teams', error: error.message });
    }
});


// --- Start the Server ---















// 5. Start the server and listen for connections on the port
app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
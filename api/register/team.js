// api/register/team.js
const connectDB = require('../../../lib/mongo');
const { Team } = require('../../../Models/SIHSCHEMA');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const teamData = req.body;
    teamData.members = teamData.members.filter(m => m.name && m.name.trim() !== '');

    const newTeam = new Team(teamData);
    await newTeam.save();

    res.status(201).json(newTeam);
  } catch (error) {
    console.error('❌ Error during team registration:', error);

    if (error.code === 11000) {
      return res.status(409).json({ message: 'This team name is already taken' });
    }

    res.status(400).json({ message: 'Team registration failed', error: error.message });
  }
};

const connectDB = require('../lib/mongo');
const { Team } = require('../../Models/SIHSCHEMA');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const teams = await Team.find().sort({ registeredAt: -1 });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch teams', error: error.message });
  }
};

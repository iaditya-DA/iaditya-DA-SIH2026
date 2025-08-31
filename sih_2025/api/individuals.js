import connectDB from '../lib/mongo.js';
import { Individual } from '../../Models/SIHSCHEMA.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const individuals = await Individual.find().sort({ registeredAt: -1 });
    res.status(200).json(individuals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch individuals', error: error.message });
  }
};


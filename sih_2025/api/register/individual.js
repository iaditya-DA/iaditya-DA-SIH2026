// api/register/individual.js
import connectDB from '../../lib/mongo.js';
import { Individual } from '../Models/SIHSCHEMA.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const individualData = req.body;
    const newIndividual = new Individual(individualData);
    await newIndividual.save();

    res.status(201).json(newIndividual);
  } catch (error) {
    console.error('❌ Error during individual registration:', error);
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
};

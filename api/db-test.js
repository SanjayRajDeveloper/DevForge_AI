import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ error: 'MONGODB_URI is missing' });
    }

    await mongoose.connect(process.env.MONGODB_URI);

    return res.status(200).json({
      ok: true,
      message: 'MongoDB connected successfully'
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}

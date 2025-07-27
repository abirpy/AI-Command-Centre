import express from 'express';
import { POI } from '../models/index.js';

const router = express.Router();

// Get all POIs
router.get('/', async (req, res) => {
  try {
    const pois = await POI.find().sort({ name: 1 });
    res.json(pois);
  } catch (error) {
    console.error('Error fetching POIs:', error);
    res.status(500).json({ error: 'Failed to fetch POIs' });
  }
});

// Get specific POI by ID
router.get('/:id', async (req, res) => {
  try {
    const poi = await POI.findOne({ id: req.params.id });
    if (!poi) {
      return res.status(404).json({ error: 'POI not found' });
    }
    res.json(poi);
  } catch (error) {
    console.error('Error fetching POI:', error);
    res.status(500).json({ error: 'Failed to fetch POI' });
  }
});

// Update POI (e.g., material amounts)
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    const poi = await POI.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!poi) {
      return res.status(404).json({ error: 'POI not found' });
    }

    const io = req.app.get('io');
    io.emit('poi-update', poi);
    console.log(`📍 [POI Updated] Emitted poi-update event: "${poi.name}" (ID: ${poi.id})`);

    res.json(poi);
  } catch (error) {
    console.error('Error updating POI:', error);
    res.status(500).json({ error: 'Failed to update POI' });
  }
});

export default router; 
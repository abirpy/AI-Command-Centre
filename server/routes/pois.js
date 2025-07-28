import express from 'express'
import { POI } from '../models/index.js'

const router = express.Router()

// Get all POIs
router.get('/', async (req, res) => {
  try {
    const pois = await POI.find().sort({ name: 1 })
    res.json(pois)
  } catch (error) {
    console.error('Error fetching POIs:', error)
    res.status(500).json({ error: 'Failed to fetch POIs' })
  }
})

// Get specific POI by ID
router.get('/:id', async (req, res) => {
  try {
    const poi = await POI.findOne({ id: req.params.id })
    if (!poi) {
      return res.status(404).json({ error: 'POI not found' })
    }
    res.json(poi)
  } catch (error) {
    console.error('Error fetching POI:', error)
    res.status(500).json({ error: 'Failed to fetch POI' })
  }
})

// Create new POI
router.post('/', async (req, res) => {
  try {
    const { name, type, position, materials, capacity, description } = req.body

    // Validation
    if (!name || !type || !position) {
      return res.status(400).json({ error: 'Name, type, and position are required' })
    }

    if (!position.lat || !position.lng) {
      return res.status(400).json({ error: 'Position must include lat and lng' })
    }

    // Validate POI type
    const validTypes = ['storage_zone', 'crusher', 'loading_dock', 'workshop', 'office', 'parking', 'fuel_station']
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid POI type' })
    }

    const newPOI = new POI({
      id: `poi-${Date.now()}`,
      name,
      type,
      position,
      materials: materials || [],
      capacity: capacity || 1000,
      currentAmount: req.body.currentAmount || 0,
      status: 'operational',
      description: description || '',
      metadata: { equipment: [] }
    })

    const savedPOI = await newPOI.save()
    res.status(201).json(savedPOI)
  } catch (error) {
    console.error('Error creating POI:', error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to create POI' })
  }
})

// Update POI (e.g., material amounts)
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body

    // First, get the current POI to validate against
    const currentPOI = await POI.findOne({ id: req.params.id })
    if (!currentPOI) {
      return res.status(404).json({ error: 'POI not found' })
    }

    // Validate currentAmount if it's being updated
    if (updates.currentAmount !== undefined) {
      if (updates.currentAmount > currentPOI.capacity) {
        return res.status(400).json({ error: 'Current amount cannot exceed POI capacity' })
      }
    }

    const poi = await POI.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true, runValidators: false } // Disable validators since we're handling validation manually
    )

    const io = req.app.get('io')
    io.emit('poi-update', poi)
    console.log(`📍 [POI Updated] Emitted poi-update event: "${poi.name}" (ID: ${poi.id})`)

    res.json(poi)
  } catch (error) {
    console.error('Error updating POI:', error)
    res.status(500).json({ error: 'Failed to update POI' })
  }
})

// Delete POI
router.delete('/:id', async (req, res) => {
  try {
    const poi = await POI.findOneAndDelete({ id: req.params.id })
    if (!poi) {
      return res.status(404).json({ error: 'POI not found' })
    }
    res.json({ message: 'POI deleted successfully' })
  } catch (error) {
    console.error('Error deleting POI:', error)
    res.status(500).json({ error: 'Failed to delete POI' })
  }
})

export default router

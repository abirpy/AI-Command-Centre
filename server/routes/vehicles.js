import express from 'express'
import { Vehicle } from '../models/index.js'

const router = express.Router()

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ lastUpdate: -1 })
    res.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    res.status(500).json({ error: 'Failed to fetch vehicles' })
  }
})

// Get specific vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ id: req.params.id })
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }
    res.json(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    res.status(500).json({ error: 'Failed to fetch vehicle' })
  }
})

// Create new vehicle
router.post('/', async (req, res) => {
  try {
    const { name, type, position, location, capacity, metadata } = req.body

    if (!name || !type || (!position && !location)) {
      return res.status(400).json({ error: 'Name, type, and position/location are required' })
    }

    const newVehicle = new Vehicle({
      id: `vehicle-${Date.now()}`,
      name,
      type,
      position: position || location,
      status: 'idle',
      capacity: capacity || 100,
      currentLoad: 0,
      batteryLevel: 100,
      lastUpdate: new Date().toISOString(),
      destination: null,
      route: [],
      metadata: metadata || {}
    })

    const savedVehicle = await newVehicle.save()
    res.status(201).json(savedVehicle)
  } catch (error) {
    console.error('Error creating vehicle:', error)
    res.status(500).json({ error: 'Failed to create vehicle' })
  }
})

// Update vehicle position and status
router.put('/:id', async (req, res) => {
  try {
    const { position, location, status, currentLoad, batteryLevel, destination, route } = req.body

    const updateData = {}
    if (position) updateData.position = position
    if (location) updateData.position = location // Handle both position and location
    if (status) updateData.status = status
    if (currentLoad !== undefined) updateData.currentLoad = currentLoad
    if (batteryLevel !== undefined) updateData.batteryLevel = batteryLevel
    if (destination !== undefined) updateData.destination = destination
    if (route) updateData.route = route

    const vehicle = await Vehicle.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    )

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }

    // Broadcast vehicle update to all clients
    const io = req.app.get('io')
    io.emit('vehicle-update', vehicle)
    console.log(`🚛 [Vehicle Updated] Emitted vehicle-update event: "${vehicle.name}" (ID: ${vehicle.id})`)

    res.json(vehicle)
  } catch (error) {
    console.error('Error updating vehicle:', error)
    res.status(500).json({ error: 'Failed to update vehicle' })
  }
})

// Simulate vehicle movement (for demo purposes)
router.post('/:id/move', async (req, res) => {
  try {
    const { destination } = req.body

    const vehicle = await Vehicle.findOne({ id: req.params.id })
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }

    // Simple route calculation (in a real system, this would use proper pathfinding)
    const route = [
      vehicle.position,
      {
        lat: vehicle.position.lat + (Math.random() - 0.5) * 0.01,
        lng: vehicle.position.lng + (Math.random() - 0.5) * 0.01
      },
      destination
    ]

    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { id: req.params.id },
      {
        status: 'moving',
        destination,
        route
      },
      { new: true, runValidators: true }
    )

    const io = req.app.get('io')
    io.emit('vehicle-update', updatedVehicle)
    console.log(`🚛 [Vehicle Moved] Emitted vehicle-update event: "${updatedVehicle.name}" moved to ${JSON.stringify(destination)}`)

    res.json(updatedVehicle)
  } catch (error) {
    console.error('Error moving vehicle:', error)
    res.status(500).json({ error: 'Failed to move vehicle' })
  }
})

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ id: req.params.id })
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }
    res.json({ message: 'Vehicle deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    res.status(500).json({ error: 'Failed to delete vehicle' })
  }
})

export default router

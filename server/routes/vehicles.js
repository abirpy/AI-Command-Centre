import express from 'express';
import { Vehicle } from '../models/index.js';

const router = express.Router();

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ lastUpdate: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get specific vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ id: req.params.id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Update vehicle position and status
router.put('/:id', async (req, res) => {
  try {
    const { position, status, currentLoad, batteryLevel, destination, route } = req.body;
    
    const updateData = {};
    if (position) updateData.position = position;
    if (status) updateData.status = status;
    if (currentLoad !== undefined) updateData.currentLoad = currentLoad;
    if (batteryLevel !== undefined) updateData.batteryLevel = batteryLevel;
    if (destination !== undefined) updateData.destination = destination;
    if (route) updateData.route = route;
    
    const vehicle = await Vehicle.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Broadcast vehicle update to all clients
    const io = req.app.get('io');
    io.emit('vehicle-update', vehicle);
    console.log(`🚛 [Vehicle Updated] Emitted vehicle-update event: "${vehicle.name}" (ID: ${vehicle.id})`);

    res.json(vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Simulate vehicle movement (for demo purposes)
router.post('/:id/move', async (req, res) => {
  try {
    const { destination } = req.body;
    
    const vehicle = await Vehicle.findOne({ id: req.params.id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // Simple route calculation (in a real system, this would use proper pathfinding)
    const route = [
      vehicle.position,
      { 
        lat: vehicle.position.lat + (Math.random() - 0.5) * 0.01,
        lng: vehicle.position.lng + (Math.random() - 0.5) * 0.01
      },
      destination
    ];

    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { id: req.params.id },
      {
        status: 'moving',
        destination: destination,
        route: route
      },
      { new: true, runValidators: true }
    );

    const io = req.app.get('io');
    io.emit('vehicle-update', updatedVehicle);
    console.log(`🚛 [Vehicle Moved] Emitted vehicle-update event: "${updatedVehicle.name}" moved to ${JSON.stringify(destination)}`);

    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error moving vehicle:', error);
    res.status(500).json({ error: 'Failed to move vehicle' });
  }
});

export default router; 
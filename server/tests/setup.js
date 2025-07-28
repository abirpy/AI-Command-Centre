import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Vehicle, Task, POI, ChatMessage, Material } from '../models/index.js'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Mock data for tests
const mockVehicles = [
  {
    id: 'truck-001',
    name: 'Mining Truck Alpha',
    type: 'haul_truck',
    position: { lat: 40.7589, lng: -111.8883 },
    status: 'idle',
    capacity: 100,
    currentLoad: 0,
    batteryLevel: 85,
    lastUpdate: new Date().toISOString(),
    destination: null,
    route: [],
    metadata: {
      manufacturer: 'Caterpillar',
      model: 'CAT 797F',
      year: 2022,
      serialNumber: 'CAT797F-001'
    }
  }
]

const mockPOIs = [
  {
    id: 'zone-a',
    name: 'Zone A - Material A Storage',
    type: 'storage_zone',
    position: { lat: 40.7549, lng: -111.8823 },
    materials: ['Material A'],
    capacity: 1000,
    currentAmount: 750,
    status: 'operational',
    description: 'Primary storage zone for Material A',
    availableSpace: 250,
    utilizationPercentage: 75,
    metadata: {
      equipment: ['conveyor-belt-01', 'sensor-array-01']
    }
  }
]

const mockChatMessages = [
  {
    id: 'msg-001',
    message: 'Vehicle status check completed.',
    sender: 'operator',
    vehicleId: 'truck-001',
    timestamp: new Date(Date.now() - 300000),
    messageType: 'status',
    priority: 'normal',
    isRead: true
  }
]

const mockTasks = [
  {
    id: 'task-001',
    title: 'Test Task',
    description: 'This is a test task',
    vehicleId: 'truck-001',
    status: 'pending_approval',
    priority: 'medium',
    estimatedDuration: 30,
    steps: [
      {
        id: 'step-001',
        stepNumber: 1,
        action: 'Move to location',
        description: 'Navigate to specified location',
        estimatedDuration: 10,
        status: 'pending',
        parameters: { destination: { lat: 40.7589, lng: -111.8883 } }
      }
    ],
    originalInstruction: 'Move to test location',
    decompositionSummary: 'Task decomposed into 1 step'
  }
]

// Global test setup
beforeAll(async () => {
  // Connect to test database
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
  await mongoose.connect(mongoURI)
})

// Global test teardown
afterAll(async () => {
  // Close database connection
  await mongoose.connection.close()
})

// Clean up and seed database between tests
afterEach(async () => {
  // Clear existing data
  await Vehicle.deleteMany({})
  await POI.deleteMany({})
  await Material.deleteMany({})
  await ChatMessage.deleteMany({})
  await Task.deleteMany({})

  // Seed with test data
  await Vehicle.insertMany(mockVehicles)
  await POI.insertMany(mockPOIs)
  await ChatMessage.insertMany(mockChatMessages)
  await Task.insertMany(mockTasks)
})

import mongoose from 'mongoose'
import connectDB from '../config/database.js'
import { Vehicle, Task, POI, ChatMessage, Material } from '../models/index.js'

// Import mock data structure for reference
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
      serialNumber: 'CAT797F-001',
      lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    }
  },
  {
    id: 'truck-002',
    name: 'Mining Truck Beta',
    type: 'haul_truck',
    position: { lat: 40.7609, lng: -111.8901 },
    status: 'moving',
    capacity: 100,
    currentLoad: 75,
    batteryLevel: 62,
    lastUpdate: new Date().toISOString(),
    destination: 'crusher-01',
    route: [
      { lat: 40.7609, lng: -111.8901 },
      { lat: 40.7619, lng: -111.8921 },
      { lat: 40.7629, lng: -111.8941 }
    ],
    metadata: {
      manufacturer: 'Komatsu',
      model: 'HD605-8',
      year: 2021,
      serialNumber: 'KOM605-002'
    }
  },
  {
    id: 'excavator-001',
    name: 'Excavator Prime',
    type: 'excavator',
    position: { lat: 40.7569, lng: -111.8863 },
    status: 'working',
    capacity: 50,
    currentLoad: 0,
    batteryLevel: 91,
    lastUpdate: new Date().toISOString(),
    destination: null,
    route: [],
    metadata: {
      manufacturer: 'Liebherr',
      model: 'R 9800',
      year: 2023,
      serialNumber: 'LIE9800-001'
    }
  },
  {
    id: 'loader-001',
    name: 'Loader Unit 1',
    type: 'loader',
    position: { lat: 40.7549, lng: -111.8843 },
    status: 'idle',
    capacity: 75,
    currentLoad: 0,
    batteryLevel: 78,
    lastUpdate: new Date().toISOString(),
    destination: null,
    route: [],
    metadata: {
      manufacturer: 'Volvo',
      model: 'L350H',
      year: 2022,
      serialNumber: 'VOL350-001'
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
    description: 'Primary storage area for Material A',
    metadata: {
      operatingHours: { start: '06:00', end: '22:00' },
      supervisor: 'John Smith',
      equipment: ['Conveyor Belt A-1', 'Scale System A-2'],
      lastInspection: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextInspection: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000)
    }
  },
  {
    id: 'zone-b',
    name: 'Zone B - Material B Storage',
    type: 'storage_zone',
    position: { lat: 40.7589, lng: -111.8823 },
    materials: ['Material B'],
    capacity: 800,
    currentAmount: 450,
    status: 'operational',
    description: 'Storage area for Material B',
    metadata: {
      operatingHours: { start: '06:00', end: '22:00' },
      supervisor: 'Jane Doe',
      equipment: ['Conveyor Belt B-1']
    }
  },
  {
    id: 'zone-c',
    name: 'Zone C - Mixed Storage',
    type: 'storage_zone',
    position: { lat: 40.7629, lng: -111.8823 },
    materials: ['Material A', 'Material B'],
    capacity: 1200,
    currentAmount: 200,
    status: 'operational',
    description: 'Mixed material storage zone'
  },
  {
    id: 'crusher-01',
    name: 'Primary Crusher',
    type: 'crusher',
    position: { lat: 40.7629, lng: -111.8941 },
    materials: [],
    capacity: 500,
    currentAmount: 0,
    status: 'operational',
    description: 'Main crushing facility',
    metadata: {
      operatingHours: { start: '00:00', end: '23:59' },
      supervisor: 'Mike Johnson',
      equipment: ['Primary Jaw Crusher', 'Conveyor System C-1']
    }
  },
  {
    id: 'loading-dock-01',
    name: 'Loading Dock Alpha',
    type: 'loading_dock',
    position: { lat: 40.7509, lng: -111.8803 },
    materials: [],
    capacity: 200,
    currentAmount: 0,
    status: 'operational',
    description: 'Primary loading dock for material pickup'
  }
]

const mockMaterials = [
  {
    name: 'Material A',
    type: 'ore',
    density: 2.5,
    color: '#8B4513',
    description: 'Primary ore material',
    properties: {
      hardness: 7.5,
      toxicity: 'low',
      flammability: 'none',
      corrosiveness: 'none',
      radioactivity: false
    },
    economicData: {
      pricePerTon: 850,
      currency: 'USD',
      marketDemand: 'high',
      lastUpdated: new Date()
    },
    compliance: {
      regulations: ['MSHA-001', 'EPA-MINING-2023'],
      certifications: ['ISO-14001'],
      environmentalImpact: 'low'
    }
  },
  {
    name: 'Material B',
    type: 'mineral',
    density: 1.8,
    color: '#696969',
    description: 'Secondary processing material',
    properties: {
      hardness: 5.2,
      toxicity: 'none',
      flammability: 'none',
      corrosiveness: 'low',
      radioactivity: false
    },
    economicData: {
      pricePerTon: 420,
      currency: 'USD',
      marketDemand: 'medium',
      lastUpdated: new Date()
    },
    compliance: {
      environmentalImpact: 'minimal'
    }
  }
]

const mockChatMessages = [
  {
    id: 'msg-001',
    message: 'System initialized. Ready for commands.',
    sender: 'system',
    vehicleId: 'truck-001',
    timestamp: new Date(Date.now() - 300000),
    messageType: 'status',
    priority: 'normal',
    isRead: true
  },
  {
    id: 'msg-002',
    message: 'Battery level optimal. All systems operational.',
    sender: 'vehicle',
    vehicleId: 'truck-001',
    timestamp: new Date(Date.now() - 240000),
    messageType: 'status',
    priority: 'normal',
    isRead: true
  },
  {
    id: 'msg-003',
    message: 'Currently en route to crusher facility.',
    sender: 'vehicle',
    vehicleId: 'truck-002',
    timestamp: new Date(Date.now() - 180000),
    messageType: 'status',
    priority: 'normal',
    isRead: false
  },
  {
    id: 'msg-004',
    message: 'Excavation operations in progress.',
    sender: 'vehicle',
    vehicleId: 'excavator-001',
    timestamp: new Date(Date.now() - 120000),
    messageType: 'status',
    priority: 'normal',
    isRead: false
  },
  {
    id: 'msg-005',
    message: 'Awaiting loading instructions.',
    sender: 'vehicle',
    vehicleId: 'loader-001',
    timestamp: new Date(Date.now() - 60000),
    messageType: 'status',
    priority: 'normal',
    isRead: false
  }
]

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...')

    // Connect to database
    await connectDB()

    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await Vehicle.deleteMany({})
    await POI.deleteMany({})
    await Material.deleteMany({})
    await ChatMessage.deleteMany({})
    await Task.deleteMany({})

    // Seed Materials first (referenced by POIs)
    console.log('📦 Seeding materials...')
    await Material.insertMany(mockMaterials)
    console.log(`✅ ${mockMaterials.length} materials seeded`)

    // Seed Vehicles
    console.log('🚛 Seeding vehicles...')
    await Vehicle.insertMany(mockVehicles)
    console.log(`✅ ${mockVehicles.length} vehicles seeded`)

    // Seed POIs
    console.log('📍 Seeding POIs...')
    await POI.insertMany(mockPOIs)
    console.log(`✅ ${mockPOIs.length} POIs seeded`)

    // Seed Chat Messages
    console.log('💬 Seeding chat messages...')
    await ChatMessage.insertMany(mockChatMessages)
    console.log(`✅ ${mockChatMessages.length} chat messages seeded`)

    // No tasks seeded initially (they will be created via API)

    console.log('🎉 Database seeding completed successfully!')

    // Display summary
    const summary = {
      vehicles: await Vehicle.countDocuments(),
      pois: await POI.countDocuments(),
      materials: await Material.countDocuments(),
      chatMessages: await ChatMessage.countDocuments(),
      tasks: await Task.countDocuments()
    }

    console.log('📊 Database Summary:')
    console.table(summary)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run seeding if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('seedDatabase.js')) {
  seedDatabase()
}

export default seedDatabase

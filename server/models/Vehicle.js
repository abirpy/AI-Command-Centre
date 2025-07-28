import mongoose from 'mongoose'

const vehicleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['haul_truck', 'excavator', 'loader', 'drill', 'bulldozer'],
    index: true
  },
  position: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['idle', 'moving', 'working', 'maintenance', 'offline'],
    default: 'idle',
    index: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  currentLoad: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    validate: {
      validator: function (value) {
        return value <= this.capacity
      },
      message: 'Current load cannot exceed vehicle capacity'
    }
  },
  batteryLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
    index: true
  },
  destination: {
    type: String,
    default: null
  },
  route: [{
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    }
  }],
  metadata: {
    manufacturer: String,
    model: String,
    year: Number,
    serialNumber: String,
    lastMaintenance: Date,
    nextMaintenance: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for battery status
vehicleSchema.virtual('batteryStatus').get(function () {
  if (this.batteryLevel >= 75) return 'good'
  if (this.batteryLevel >= 50) return 'fair'
  if (this.batteryLevel >= 25) return 'low'
  return 'critical'
})

// Virtual for load percentage
vehicleSchema.virtual('loadPercentage').get(function () {
  return Math.round((this.currentLoad / this.capacity) * 100)
})

// Index for geospatial queries
vehicleSchema.index({ 'position.lat': 1, 'position.lng': 1 })

// Middleware to update lastUpdate on save
vehicleSchema.pre('save', function (next) {
  this.lastUpdate = new Date()
  next()
})

const Vehicle = mongoose.model('Vehicle', vehicleSchema)

export default Vehicle

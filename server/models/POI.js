import mongoose from 'mongoose';

const poiSchema = new mongoose.Schema({
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
    enum: ['storage_zone', 'crusher', 'loading_dock', 'workshop', 'office', 'parking', 'fuel_station'],
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
  materials: [{
    type: String,
    trim: true
  }],
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    validate: {
      validator: function(value) {
        return value <= this.capacity;
      },
      message: 'Current amount cannot exceed POI capacity'
    }
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'offline', 'full', 'empty'],
    default: 'operational',
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  metadata: {
    operatingHours: {
      start: String,
      end: String
    },
    supervisor: String,
    equipment: [String],
    lastInspection: Date,
    nextInspection: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for capacity utilization percentage
poiSchema.virtual('utilizationPercentage').get(function() {
  return Math.round((this.currentAmount / this.capacity) * 100);
});

// Virtual for available space
poiSchema.virtual('availableSpace').get(function() {
  return this.capacity - this.currentAmount;
});

// Index for geospatial queries
poiSchema.index({ 'position.lat': 1, 'position.lng': 1 });

// Index for material types
poiSchema.index({ materials: 1 });

const POI = mongoose.model('POI', poiSchema);

export default POI; 
import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['ore', 'mineral', 'waste', 'processed', 'fuel', 'equipment', 'chemical'],
    index: true
  },
  density: {
    type: Number,
    required: true,
    min: 0,
    comment: 'Density in tons per cubic meter'
  },
  color: {
    type: String,
    required: true,
    match: /^#[0-9A-F]{6}$/i,
    comment: 'Hex color code for visualization'
  },
  description: {
    type: String,
    trim: true
  },
  properties: {
    hardness: Number,
    toxicity: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'extreme'],
      default: 'none'
    },
    flammability: {
      type: String,
      enum: ['none', 'low', 'medium', 'high'],
      default: 'none'
    },
    corrosiveness: {
      type: String,
      enum: ['none', 'low', 'medium', 'high'],
      default: 'none'
    },
    radioactivity: {
      type: Boolean,
      default: false
    }
  },
  handlingRequirements: {
    specialEquipment: [String],
    safetyPrecautions: [String],
    storageConditions: {
      temperature: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ['celsius', 'fahrenheit'],
          default: 'celsius'
        }
      },
      humidity: {
        min: Number,
        max: Number
      },
      ventilation: {
        type: String,
        enum: ['none', 'standard', 'enhanced', 'special'],
        default: 'standard'
      }
    }
  },
  economicData: {
    pricePerTon: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    marketDemand: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      default: 'medium'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  compliance: {
    regulations: [String],
    certifications: [String],
    environmentalImpact: {
      type: String,
      enum: ['minimal', 'low', 'medium', 'high', 'severe'],
      default: 'minimal'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for safety level
materialSchema.virtual('safetyLevel').get(function() {
  const toxicity = this.properties.toxicity || 'none';
  const flammability = this.properties.flammability || 'none';
  const corrosiveness = this.properties.corrosiveness || 'none';
  const radioactivity = this.properties.radioactivity || false;
  
  if (radioactivity || toxicity === 'extreme' || 
      (toxicity === 'high' && (flammability === 'high' || corrosiveness === 'high'))) {
    return 'critical';
  }
  if (toxicity === 'high' || flammability === 'high' || corrosiveness === 'high') {
    return 'high';
  }
  if (toxicity === 'medium' || flammability === 'medium' || corrosiveness === 'medium') {
    return 'medium';
  }
  if (toxicity === 'low' || flammability === 'low' || corrosiveness === 'low') {
    return 'low';
  }
  return 'minimal';
});

// Index for common queries
materialSchema.index({ type: 1 });
materialSchema.index({ 'properties.toxicity': 1 });
materialSchema.index({ 'economicData.pricePerTon': 1 });

const Material = mongoose.model('Material', materialSchema);

export default Material; 
import mongoose from 'mongoose'

const stepSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  stepNumber: {
    type: Number,
    required: true,
    min: 1
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 0
  },
  actualDuration: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'skipped'],
    default: 'pending'
  },
  startedAt: Date,
  completedAt: Date,
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  _id: false
})

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  vehicleId: {
    type: String,
    ref: 'Vehicle',
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending_approval', 'approved', 'rejected', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'pending_approval',
    index: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 0
  },
  actualDuration: {
    type: Number,
    min: 0
  },
  steps: [stepSchema],
  originalInstruction: {
    type: String,
    required: true,
    trim: true
  },
  decompositionSummary: {
    type: String,
    trim: true
  },
  feedback: {
    type: String,
    trim: true
  },
  assignedBy: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: String,
    trim: true
  },
  approvedAt: Date,
  rejectedAt: Date,
  startedAt: Date,
  completedAt: Date,
  metadata: {
    estimatedCost: Number,
    actualCost: Number,
    materials: [String],
    locations: [String],
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function () {
  if (this.steps.length === 0) return 0
  const completedSteps = this.steps.filter(step => step.status === 'completed').length
  return Math.round((completedSteps / this.steps.length) * 100)
})

// Virtual for current step
taskSchema.virtual('currentStep').get(function () {
  return this.steps.find(step => step.status === 'in_progress') ||
         this.steps.find(step => step.status === 'pending')
})

// Virtual for total estimated duration
taskSchema.virtual('totalEstimatedDuration').get(function () {
  return this.steps.reduce((total, step) => total + step.estimatedDuration, 0)
})

// Virtual for elapsed time
taskSchema.virtual('elapsedTime').get(function () {
  if (!this.startedAt) return 0
  const endTime = this.completedAt || new Date()
  return Math.round((endTime - this.startedAt) / (1000 * 60)) // in minutes
})

// Index for queries
taskSchema.index({ status: 1, priority: 1 })
taskSchema.index({ vehicleId: 1, status: 1 })
taskSchema.index({ createdAt: -1 })

// Middleware to update actualDuration when completed
taskSchema.pre('save', function (next) {
  if (this.status === 'completed' && this.startedAt && !this.actualDuration) {
    this.actualDuration = Math.round((new Date() - this.startedAt) / (1000 * 60))
  }
  next()
})

const Task = mongoose.model('Task', taskSchema)

export default Task

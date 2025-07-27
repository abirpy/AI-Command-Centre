import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  sender: {
    type: String,
    required: true,
    enum: ['user', 'vehicle', 'system', 'operator'],
    index: true
  },
  vehicleId: {
    type: String,
    required: true,
    ref: 'Vehicle',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  messageType: {
    type: String,
    enum: ['text', 'command', 'status', 'alert', 'notification'],
    default: 'text'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    location: {
      lat: Number,
      lng: Number
    },
    attachments: [{
      type: String,
      url: String,
      size: Number
    }],
    relatedTaskId: String,
    commandResult: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for message age
chatMessageSchema.virtual('age').get(function() {
  const now = new Date();
  const diff = now - this.timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
});

// Index for efficient querying
chatMessageSchema.index({ vehicleId: 1, timestamp: -1 });
chatMessageSchema.index({ sender: 1, timestamp: -1 });
chatMessageSchema.index({ vehicleId: 1, isRead: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage; 
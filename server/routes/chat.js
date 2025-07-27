import express from 'express';
import { ChatMessage } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get chat messages for a specific vehicle
router.get('/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    
    const messages = await ChatMessage.find({ vehicleId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Add a new chat message
router.post('/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { message, sender, messageType = 'text', priority = 'normal' } = req.body;

    if (!message || !sender) {
      return res.status(400).json({ error: 'Message and sender are required' });
    }

    const newMessage = new ChatMessage({
      id: uuidv4(),
      message,
      sender,
      vehicleId,
      messageType,
      priority,
      timestamp: new Date(),
      isRead: false
    });

    await newMessage.save();

    // Emit to Socket.IO clients
    const io = req.app.get('io');
    io.to(`vehicle-${vehicleId}`).emit('new-message', newMessage);
    console.log(`📡 [HTTP API] Emitted message from ${newMessage.sender} to vehicle-${vehicleId} via Socket.IO`);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Generate AI response (mock implementation)
router.post('/:vehicleId/ai-response', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { userMessage } = req.body;

    // Simple AI response logic (in production, this would connect to an actual AI service)
    let aiResponse = "Command received. Processing...";
    let messageType = 'text';
    let priority = 'normal';
    
    if (userMessage.toLowerCase().includes('status')) {
      aiResponse = "All systems operational. Battery level good. Ready for new tasks.";
      messageType = 'status';
    } else if (userMessage.toLowerCase().includes('move') || userMessage.toLowerCase().includes('go')) {
      aiResponse = "Navigation systems engaged. Beginning movement to specified location.";
      messageType = 'command';
    } else if (userMessage.toLowerCase().includes('load') || userMessage.toLowerCase().includes('pick up')) {
      aiResponse = "Initiating loading sequence. Positioning for material pickup.";
      messageType = 'command';
    } else if (userMessage.toLowerCase().includes('stop') || userMessage.toLowerCase().includes('halt')) {
      aiResponse = "Emergency stop activated. All operations halted.";
      messageType = 'alert';
      priority = 'high';
    }

    const aiMessage = new ChatMessage({
      id: uuidv4(),
      message: aiResponse,
      sender: 'vehicle',
      vehicleId,
      messageType,
      priority,
      timestamp: new Date(),
      isRead: false
    });

    await aiMessage.save();

    const io = req.app.get('io');
    io.to(`vehicle-${vehicleId}`).emit('new-message', aiMessage);
    console.log(`🤖 [AI Response] Emitted AI message to vehicle-${vehicleId} via Socket.IO: "${aiResponse}"`);

    res.json(aiMessage);
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

export default router; 
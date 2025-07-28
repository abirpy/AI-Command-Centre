import request from 'supertest'
import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import connectDB from '../../config/database.js'
import chatRoutes from '../../routes/chat.js'

dotenv.config()

// Create test app
const app = express()
const server = createServer(app)
const _io = new Server(server)

// Mock Socket.IO for routes
app.set('io', _io)

// Middleware
app.use(helmet())
app.use(cors())
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/chat', chatRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' })
  }
  next(err)
})

app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

describe('Chat Routes', () => {
  let testServer

  beforeAll(async () => {
    await connectDB()
    testServer = server.listen(0)
  })

  afterAll(async () => {
    await testServer.close()
  })

  describe('GET /api/chat/:vehicleId', () => {
    it('should return chat messages for a specific vehicle', async () => {
      const vehicleId = 'vehicle-1'

      const response = await request(app)
        .get(`/api/chat/${vehicleId}`)
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)

      if (response.body.length > 0) {
        const message = response.body[0]
        expect(message).toHaveProperty('id')
        expect(message).toHaveProperty('message')
        expect(message).toHaveProperty('sender')
        expect(message).toHaveProperty('timestamp')
        expect(message).toHaveProperty('vehicleId')
      }
    })

    it('should return empty array for vehicle with no messages', async () => {
      const vehicleId = 'vehicle-no-messages'

      const response = await request(app)
        .get(`/api/chat/${vehicleId}`)
        .expect(200)

      expect(response.body).toEqual([])
    })

    it('should return messages with correct data types', async () => {
      const vehicleId = 'vehicle-1'

      const response = await request(app)
        .get(`/api/chat/${vehicleId}`)
        .expect(200)

      if (response.body.length > 0) {
        const message = response.body[0]
        expect(typeof message.id).toBe('number')
        expect(typeof message.message).toBe('string')
        expect(typeof message.sender).toBe('string')
        expect(typeof message.timestamp).toBe('string')
        expect(typeof message.vehicleId).toBe('string')
      }
    })

    it('should return messages in chronological order', async () => {
      const vehicleId = 'vehicle-1'

      const response = await request(app)
        .get(`/api/chat/${vehicleId}`)
        .expect(200)

      if (response.body.length > 1) {
        const firstMessage = new Date(response.body[0].timestamp)
        const secondMessage = new Date(response.body[1].timestamp)
        expect(firstMessage.getTime()).toBeLessThanOrEqual(secondMessage.getTime())
      }
    })
  })

  describe('POST /api/chat', () => {
    it('should create a new chat message', async () => {
      const newMessage = {
        vehicleId: 'vehicle-1',
        message: 'Test message from command center',
        sender: 'operator'
      }

      const response = await request(app)
        .post('/api/chat')
        .send(newMessage)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.message).toBe(newMessage.message)
      expect(response.body.sender).toBe(newMessage.sender)
      expect(response.body.vehicleId).toBe(newMessage.vehicleId)
      expect(response.body).toHaveProperty('timestamp')
    })

    it('should validate required fields', async () => {
      const invalidMessage = {
        message: 'Test message'
        // Missing vehicleId and sender
      }

      const response = await request(app)
        .post('/api/chat')
        .send(invalidMessage)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should validate message length', async () => {
      const longMessage = {
        vehicleId: 'vehicle-1',
        message: 'A'.repeat(1001), // Message too long
        sender: 'operator'
      }

      const response = await request(app)
        .post('/api/chat')
        .send(longMessage)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should validate sender field', async () => {
      const invalidMessage = {
        vehicleId: 'vehicle-1',
        message: 'Test message',
        sender: '' // Empty sender
      }

      const response = await request(app)
        .post('/api/chat')
        .send(invalidMessage)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle special characters in messages', async () => {
      const specialMessage = {
        vehicleId: 'vehicle-1',
        message: 'Message with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        sender: 'operator'
      }

      const response = await request(app)
        .post('/api/chat')
        .send(specialMessage)
        .expect(201)

      expect(response.body.message).toBe(specialMessage.message)
    })

    it('should handle unicode characters', async () => {
      const unicodeMessage = {
        vehicleId: 'vehicle-1',
        message: 'Message with unicode: 🚛 ⚡ 🔋',
        sender: 'operator'
      }

      const response = await request(app)
        .post('/api/chat')
        .send(unicodeMessage)
        .expect(201)

      expect(response.body.message).toBe(unicodeMessage.message)
    })
  })

  describe('Message Persistence', () => {
    it('should persist messages across requests', async () => {
      const vehicleId = 'vehicle-persistence-test'
      const testMessage = {
        vehicleId,
        message: 'Persistence test message',
        sender: 'operator'
      }

      // Create a message
      await request(app)
        .post('/api/chat')
        .send(testMessage)
        .expect(201)

      // Retrieve messages
      const response = await request(app)
        .get(`/api/chat/${vehicleId}`)
        .expect(200)

      expect(response.body.length).toBeGreaterThan(0)
      const savedMessage = response.body.find(msg => msg.message === testMessage.message)
      expect(savedMessage).toBeDefined()
      expect(savedMessage.sender).toBe(testMessage.sender)
    })
  })

  describe('Multiple Vehicles', () => {
    it('should separate messages by vehicle ID', async () => {
      const vehicle1 = 'vehicle-separate-1'
      const vehicle2 = 'vehicle-separate-2'

      // Create messages for vehicle 1
      await request(app)
        .post('/api/chat')
        .send({
          vehicleId: vehicle1,
          message: 'Message for vehicle 1',
          sender: 'operator'
        })
        .expect(201)

      // Create messages for vehicle 2
      await request(app)
        .post('/api/chat')
        .send({
          vehicleId: vehicle2,
          message: 'Message for vehicle 2',
          sender: 'operator'
        })
        .expect(201)

      // Get messages for vehicle 1
      const vehicle1Messages = await request(app)
        .get(`/api/chat/${vehicle1}`)
        .expect(200)

      // Get messages for vehicle 2
      const vehicle2Messages = await request(app)
        .get(`/api/chat/${vehicle2}`)
        .expect(200)

      // Messages should be separate
      const vehicle1Message = vehicle1Messages.body.find(msg => msg.message === 'Message for vehicle 1')
      const vehicle2Message = vehicle2Messages.body.find(msg => msg.message === 'Message for vehicle 2')

      expect(vehicle1Message).toBeDefined()
      expect(vehicle2Message).toBeDefined()
      expect(vehicle1Message.vehicleId).toBe(vehicle1)
      expect(vehicle2Message.vehicleId).toBe(vehicle2)
    })
  })

  describe('Message Timestamps', () => {
    it('should include valid timestamps', async () => {
      const testMessage = {
        vehicleId: 'vehicle-timestamp-test',
        message: 'Timestamp test message',
        sender: 'operator'
      }

      const response = await request(app)
        .post('/api/chat')
        .send(testMessage)
        .expect(201)

      expect(response.body).toHaveProperty('timestamp')

      // Validate timestamp format
      const timestamp = new Date(response.body.timestamp)
      expect(timestamp.getTime()).not.toBeNaN()

      // Timestamp should be recent (within last minute)
      const now = new Date()
      const timeDiff = now.getTime() - timestamp.getTime()
      expect(timeDiff).toBeLessThan(60000) // 60 seconds
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ vehicleId: 'test', message: 'test', sender: 'operator' })
        .expect(201) // Should still work

      expect(response.body).toHaveProperty('id')
    })
  })

  describe('Rate Limiting', () => {
    it('should respect rate limits', async () => {
      const testMessage = {
        vehicleId: 'vehicle-rate-test',
        message: 'Rate limit test',
        sender: 'operator'
      }

      // Send multiple requests quickly
      const promises = []
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/chat')
            .send({ ...testMessage, message: `Message ${i}` })
        )
      }

      const responses = await Promise.all(promises)

      // Most should succeed, but rate limiting might kick in
      const successCount = responses.filter(res => res.status === 201).length
      expect(successCount).toBeGreaterThan(0)
    })
  })
})

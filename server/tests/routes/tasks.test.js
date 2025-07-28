import request from 'supertest'
import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import connectDB from '../../config/database.js'
import taskRoutes from '../../routes/tasks.js'

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
app.use('/api/tasks', taskRoutes)

describe('Task Routes', () => {
  let testServer

  beforeAll(async () => {
    await connectDB()
    testServer = server.listen(0)
  })

  afterAll(async () => {
    await testServer.close()
  })

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toBeGreaterThan(0)

      // Check task structure
      const task = response.body[0]
      expect(task).toHaveProperty('id')
      expect(task).toHaveProperty('title')
      expect(task).toHaveProperty('description')
      expect(task).toHaveProperty('status')
      expect(task).toHaveProperty('priority')
    })

    it('should return tasks with correct data types', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200)

      const task = response.body[0]
      expect(typeof task.id).toBe('string')
      expect(typeof task.title).toBe('string')
      expect(typeof task.description).toBe('string')
      expect(typeof task.status).toBe('string')
      expect(typeof task.priority).toBe('string')
    })
  })

  describe('GET /api/tasks/:id', () => {
    it('should return a specific task by ID', async () => {
      // First get all tasks to get an ID
      const tasksResponse = await request(app)
        .get('/api/tasks')
        .expect(200)

      const taskId = tasksResponse.body[0].id

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', taskId)
      expect(response.body).toHaveProperty('title')
      expect(response.body).toHaveProperty('description')
      expect(response.body).toHaveProperty('status')
    })

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'high',
        assignedVehicle: 'vehicle-1',
        location: { lat: 40.7128, lng: -74.0060 },
        steps: [
          { order: 1, description: 'Step 1', estimatedTime: 10 },
          { order: 2, description: 'Step 2', estimatedTime: 15 }
        ]
      }

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.title).toBe(newTask.title)
      expect(response.body.description).toBe(newTask.description)
      expect(response.body.priority).toBe(newTask.priority)
      expect(response.body.steps).toHaveLength(2)
    })

    it('should validate required fields', async () => {
      const invalidTask = {
        title: 'Test Task'
        // Missing required fields
      }

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      // First get a task to update
      const tasksResponse = await request(app)
        .get('/api/tasks')
        .expect(200)

      const taskId = tasksResponse.body[0].id
      const updateData = {
        status: 'in_progress',
        priority: 'medium'
      }

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.status).toBe(updateData.status)
      expect(response.body.priority).toBe(updateData.priority)
    })

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/non-existent-id')
        .send({ status: 'in_progress' })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      // First get a task to delete
      const tasksResponse = await request(app)
        .get('/api/tasks')
        .expect(200)

      const taskId = tasksResponse.body[0].id

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200)

      expect(response.body).toHaveProperty('message')

      // Verify task is deleted
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(404)
    })

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent-id')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })
})

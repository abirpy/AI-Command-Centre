import request from 'supertest'
import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import connectDB from '../../config/database.js'
import poiRoutes from '../../routes/pois.js'

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
app.use('/api/pois', poiRoutes)

describe('POI Routes', () => {
  let testServer

  beforeAll(async () => {
    await connectDB()
    testServer = server.listen(0)
  })

  afterAll(async () => {
    await testServer.close()
  })

  describe('GET /api/pois', () => {
    it('should return all POIs', async () => {
      const response = await request(app)
        .get('/api/pois')
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toBeGreaterThan(0)

      // Check POI structure
      const poi = response.body[0]
      expect(poi).toHaveProperty('id')
      expect(poi).toHaveProperty('name')
      expect(poi).toHaveProperty('type')
      expect(poi).toHaveProperty('description')
      expect(poi).toHaveProperty('position')
    })

    it('should return POIs with correct data types', async () => {
      const response = await request(app)
        .get('/api/pois')
        .expect(200)

      const poi = response.body[0]
      expect(typeof poi.id).toBe('string')
      expect(typeof poi.name).toBe('string')
      expect(typeof poi.type).toBe('string')
      expect(typeof poi.description).toBe('string')
      expect(poi.position).toHaveProperty('lat')
      expect(poi.position).toHaveProperty('lng')
      expect(typeof poi.position.lat).toBe('number')
      expect(typeof poi.position.lng).toBe('number')
    })

    it('should include materials array', async () => {
      const response = await request(app)
        .get('/api/pois')
        .expect(200)

      const poi = response.body[0]
      expect(poi).toHaveProperty('materials')
      expect(Array.isArray(poi.materials)).toBe(true)
    })

    it('should include capacity and currentAmount', async () => {
      const response = await request(app)
        .get('/api/pois')
        .expect(200)

      const poi = response.body[0]
      expect(poi).toHaveProperty('capacity')
      expect(poi).toHaveProperty('currentAmount')
      expect(typeof poi.capacity).toBe('number')
      expect(typeof poi.currentAmount).toBe('number')
    })
  })

  describe('GET /api/pois/:id', () => {
    it('should return a specific POI by ID', async () => {
      // First get all POIs to get an ID
      const poisResponse = await request(app)
        .get('/api/pois')
        .expect(200)

      const poiId = poisResponse.body[0].id

      const response = await request(app)
        .get(`/api/pois/${poiId}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', poiId)
      expect(response.body).toHaveProperty('name')
      expect(response.body).toHaveProperty('type')
      expect(response.body).toHaveProperty('description')
    })

    it('should return 404 for non-existent POI', async () => {
      const response = await request(app)
        .get('/api/pois/non-existent-id')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/pois', () => {
    it('should create a new POI', async () => {
      const newPOI = {
        name: 'Test Storage Zone',
        type: 'storage_zone',
        description: 'Test storage area for materials',
        position: { lat: 40.7128, lng: -74.0060 },
        materials: ['Material A', 'Material B'],
        capacity: 1000,
        currentAmount: 500,
        status: 'operational'
      }

      const response = await request(app)
        .post('/api/pois')
        .send(newPOI)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.name).toBe(newPOI.name)
      expect(response.body.type).toBe(newPOI.type)
      expect(response.body.description).toBe(newPOI.description)
      expect(response.body.materials).toEqual(newPOI.materials)
      expect(response.body.capacity).toBe(newPOI.capacity)
      expect(response.body.currentAmount).toBe(newPOI.currentAmount)
    })

    it('should validate required fields', async () => {
      const invalidPOI = {
        name: 'Test POI'
        // Missing required fields
      }

      const response = await request(app)
        .post('/api/pois')
        .send(invalidPOI)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should validate location format', async () => {
      const invalidPOI = {
        name: 'Test POI',
        type: 'storage_zone',
        description: 'Test description',
        position: { lat: 'invalid', lng: -74.0060 }, // Invalid lat
        materials: ['Material A'],
        capacity: 1000,
        currentAmount: 500
      }

      const response = await request(app)
        .post('/api/pois')
        .send(invalidPOI)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/pois/:id', () => {
    it('should update an existing POI', async () => {
      // First get a POI to update
      const poisResponse = await request(app)
        .get('/api/pois')
        .expect(200)

      const poiId = poisResponse.body[0].id
      const updateData = {
        currentAmount: 750,
        status: 'maintenance'
      }

      const response = await request(app)
        .put(`/api/pois/${poiId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.currentAmount).toBe(updateData.currentAmount)
      expect(response.body.status).toBe(updateData.status)
    })

    it('should return 404 for non-existent POI', async () => {
      const response = await request(app)
        .put('/api/pois/non-existent-id')
        .send({ currentAmount: 750 })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    it('should validate capacity constraints', async () => {
      // First get a POI to update
      const poisResponse = await request(app)
        .get('/api/pois')
        .expect(200)

      const poiId = poisResponse.body[0].id
      const updateData = {
        currentAmount: 2000 // Exceeds capacity
      }

      const response = await request(app)
        .put(`/api/pois/${poiId}`)
        .send(updateData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/pois/:id', () => {
    it('should delete an existing POI', async () => {
      // First get a POI to delete
      const poisResponse = await request(app)
        .get('/api/pois')
        .expect(200)

      const poiId = poisResponse.body[0].id

      const response = await request(app)
        .delete(`/api/pois/${poiId}`)
        .expect(200)

      expect(response.body).toHaveProperty('message')

      // Verify POI is deleted
      await request(app)
        .get(`/api/pois/${poiId}`)
        .expect(404)
    })

    it('should return 404 for non-existent POI', async () => {
      const response = await request(app)
        .delete('/api/pois/non-existent-id')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POI Type Validation', () => {
    it('should accept valid POI types', async () => {
      const validTypes = ['storage_zone', 'crusher', 'loading_dock', 'workshop']

      for (const type of validTypes) {
        const newPOI = {
          name: `Test ${type}`,
          type,
          description: 'Test description',
          position: { lat: 40.7128, lng: -74.0060 },
          materials: ['Material A'],
          capacity: 1000,
          currentAmount: 500
        }

        const response = await request(app)
          .post('/api/pois')
          .send(newPOI)
          .expect(201)

        expect(response.body.type).toBe(type)
      }
    })

    it('should reject invalid POI types', async () => {
      const invalidPOI = {
        name: 'Test POI',
        type: 'invalid_type',
        description: 'Test description',
        location: { lat: 40.7128, lng: -74.0060 },
        materials: ['Material A'],
        capacity: 1000,
        currentAmount: 500
      }

      const response = await request(app)
        .post('/api/pois')
        .send(invalidPOI)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Materials Management', () => {
    it('should handle empty materials array', async () => {
      const newPOI = {
        name: 'Empty Storage',
        type: 'storage_zone',
        description: 'Storage with no materials',
        position: { lat: 40.7128, lng: -74.0060 },
        materials: [],
        capacity: 1000,
        currentAmount: 0
      }

      const response = await request(app)
        .post('/api/pois')
        .send(newPOI)
        .expect(201)

      expect(response.body.materials).toEqual([])
    })

    it('should handle multiple materials', async () => {
      const newPOI = {
        name: 'Multi-Material Storage',
        type: 'storage_zone',
        description: 'Storage for multiple materials',
        position: { lat: 40.7128, lng: -74.0060 },
        materials: ['Material A', 'Material B', 'Material C'],
        capacity: 1500,
        currentAmount: 800
      }

      const response = await request(app)
        .post('/api/pois')
        .send(newPOI)
        .expect(201)

      expect(response.body.materials).toHaveLength(3)
      expect(response.body.materials).toContain('Material A')
      expect(response.body.materials).toContain('Material B')
      expect(response.body.materials).toContain('Material C')
    })
  })
})

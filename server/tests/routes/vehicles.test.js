import request from 'supertest'
import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import connectDB from '../../config/database.js'
import vehicleRoutes from '../../routes/vehicles.js'

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
app.use('/api/vehicles', vehicleRoutes)

describe('Vehicle Routes', () => {
  let testServer

  beforeAll(async () => {
    await connectDB()
    testServer = server.listen(0) // Use random port
  })

  afterAll(async () => {
    await testServer.close()
  })

  describe('GET /api/vehicles', () => {
    it('should return all vehicles', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toBeGreaterThan(0)

      // Check vehicle structure
      const vehicle = response.body[0]
      expect(vehicle).toHaveProperty('id')
      expect(vehicle).toHaveProperty('name')
      expect(vehicle).toHaveProperty('type')
      expect(vehicle).toHaveProperty('status')
      expect(vehicle).toHaveProperty('position')
    })

    it('should return vehicles with correct data types', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .expect(200)

      const vehicle = response.body[0]
      expect(typeof vehicle.id).toBe('string')
      expect(typeof vehicle.name).toBe('string')
      expect(typeof vehicle.type).toBe('string')
      expect(typeof vehicle.status).toBe('string')
      expect(vehicle.position).toHaveProperty('lat')
      expect(vehicle.position).toHaveProperty('lng')
      expect(typeof vehicle.position.lat).toBe('number')
      expect(typeof vehicle.position.lng).toBe('number')
    })
  })

  describe('GET /api/vehicles/:id', () => {
    it('should return a specific vehicle by ID', async () => {
      // First get all vehicles to get an ID
      const vehiclesResponse = await request(app)
        .get('/api/vehicles')
        .expect(200)

      const vehicleId = vehiclesResponse.body[0].id

      const response = await request(app)
        .get(`/api/vehicles/${vehicleId}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', vehicleId)
      expect(response.body).toHaveProperty('name')
      expect(response.body).toHaveProperty('type')
      expect(response.body).toHaveProperty('status')
    })

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .get('/api/vehicles/non-existent-id')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/vehicles', () => {
    it('should create a new vehicle', async () => {
      const newVehicle = {
        name: 'Test Vehicle',
        type: 'haul_truck',
        status: 'idle',
        location: { lat: 40.7128, lng: -74.0060 },
        specifications: {
          capacity: 100,
          fuelType: 'diesel'
        }
      }

      const response = await request(app)
        .post('/api/vehicles')
        .send(newVehicle)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.name).toBe(newVehicle.name)
      expect(response.body.type).toBe(newVehicle.type)
      expect(response.body.status).toBe(newVehicle.status)
    })

    it('should validate required fields', async () => {
      const invalidVehicle = {
        name: 'Test Vehicle'
        // Missing required fields
      }

      const response = await request(app)
        .post('/api/vehicles')
        .send(invalidVehicle)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/vehicles/:id', () => {
    it('should update an existing vehicle', async () => {
      // First get a vehicle to update
      const vehiclesResponse = await request(app)
        .get('/api/vehicles')
        .expect(200)

      const vehicleId = vehiclesResponse.body[0].id
      const updateData = {
        status: 'working',
        location: { lat: 41.0, lng: -75.0 }
      }

      const response = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.status).toBe(updateData.status)
      expect(response.body.position.lat).toBe(updateData.location.lat)
      expect(response.body.position.lng).toBe(updateData.location.lng)
    })

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .put('/api/vehicles/non-existent-id')
        .send({ status: 'working' })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/vehicles/:id', () => {
    it('should delete an existing vehicle', async () => {
      // First get a vehicle to delete
      const vehiclesResponse = await request(app)
        .get('/api/vehicles')
        .expect(200)

      const vehicleId = vehiclesResponse.body[0].id

      const response = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .expect(200)

      expect(response.body).toHaveProperty('message')

      // Verify vehicle is deleted
      await request(app)
        .get(`/api/vehicles/${vehicleId}`)
        .expect(404)
    })

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .delete('/api/vehicles/non-existent-id')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })
})

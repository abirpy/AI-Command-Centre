import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { Task, Vehicle, POI, Material } from '../models/index.js'

const router = express.Router()

// Task decomposition service
class TaskDecomposer {
  static async decomposeTask (instruction, vehicleId = null) {
    const steps = []
    let estimatedDuration = 0
    let priority = 'medium'

    // Parse the instruction to identify key actions and parameters
    const lowerInstruction = instruction.toLowerCase()

    // Extract quantities and materials
    const quantityMatch = instruction.match(/(\d+)\s*tons?/i)
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 100

    // Find mentioned materials (this will be handled dynamically in the route handlers)
    const mentionedMaterials = await Material.find().then(materials =>
      materials.filter(material =>
        lowerInstruction.includes(material.name.toLowerCase())
      ).map(m => m.name)
    )

    // Find mentioned locations/POIs (this will be handled dynamically in the route handlers)
    const mentionedPOIs = await POI.find().then(pois =>
      pois.filter(poi =>
        lowerInstruction.includes(poi.name.toLowerCase()) ||
        lowerInstruction.includes(poi.type.toLowerCase()) ||
        lowerInstruction.includes(poi.id.toLowerCase())
      )
    )

    // Determine vehicle capacity for load planning
    const vehicle = await Vehicle.findOne({ id: vehicleId })
    const vehicleCapacity = vehicle ? vehicle.capacity : 100

    if (lowerInstruction.includes('load') && lowerInstruction.includes('transport')) {
      // Complex load and transport task
      priority = 'high'
      const material = mentionedMaterials[0] || 'Material A'
      const sourceZone = mentionedPOIs.find(poi => poi.materials.includes(material)) ||
                        await POI.findOne({ materials: material })
      const destination = mentionedPOIs.find(poi =>
        lowerInstruction.includes(poi.name.toLowerCase()) && poi.type === 'crusher'
      ) || await POI.findOne({ type: 'crusher' })

      if (quantity > vehicleCapacity) {
        // Multiple trips required
        const trips = Math.ceil(quantity / vehicleCapacity)

        for (let trip = 1; trip <= trips; trip++) {
          const loadAmount = trip === trips
            ? quantity - (trip - 1) * vehicleCapacity
            : vehicleCapacity

          steps.push({
            id: uuidv4(),
            stepNumber: steps.length + 1,
            action: `Move to ${sourceZone?.name || 'loading zone'}`,
            description: `Navigate to source location for trip ${trip}`,
            estimatedDuration: 10,
            status: 'pending',
            parameters: {
              destination: sourceZone?.position || { lat: 40.7549, lng: -111.8823 },
              vehicleId
            }
          })

          steps.push({
            id: uuidv4(),
            stepNumber: steps.length + 1,
            action: `Load ${loadAmount} tons of ${material}`,
            description: `Load materials onto vehicle (${loadAmount}/${quantity} tons)`,
            estimatedDuration: 15,
            status: 'pending',
            parameters: {
              material,
              amount: loadAmount,
              sourceId: sourceZone?.id,
              vehicleId
            }
          })

          steps.push({
            id: uuidv4(),
            stepNumber: steps.length + 1,
            action: `Transport to ${destination?.name || 'crusher'}`,
            description: 'Move loaded vehicle to destination',
            estimatedDuration: 12,
            status: 'pending',
            parameters: {
              destination: destination?.position || { lat: 40.7629, lng: -111.8941 },
              destinationId: destination?.id,
              vehicleId
            }
          })

          steps.push({
            id: uuidv4(),
            stepNumber: steps.length + 1,
            action: `Unload ${loadAmount} tons`,
            description: 'Unload materials at destination',
            estimatedDuration: 10,
            status: 'pending',
            parameters: {
              amount: loadAmount,
              destinationId: destination?.id,
              vehicleId
            }
          })
        }

        estimatedDuration = trips * (10 + 15 + 12 + 10)
      } else {
        // Single trip
        steps.push({
          id: uuidv4(),
          stepNumber: 1,
          action: `Move to ${sourceZone?.name || 'loading zone'}`,
          description: 'Navigate to source location',
          estimatedDuration: 10,
          status: 'pending',
          parameters: {
            destination: sourceZone?.position || { lat: 40.7549, lng: -111.8823 },
            vehicleId
          }
        })

        steps.push({
          id: uuidv4(),
          stepNumber: 2,
          action: `Load ${quantity} tons of ${material}`,
          description: 'Load materials onto vehicle',
          estimatedDuration: 15,
          status: 'pending',
          parameters: {
            material,
            amount: quantity,
            sourceId: sourceZone?.id,
            vehicleId
          }
        })

        steps.push({
          id: uuidv4(),
          stepNumber: 3,
          action: `Transport to ${destination?.name || 'crusher'}`,
          description: 'Move loaded vehicle to destination',
          estimatedDuration: 12,
          status: 'pending',
          parameters: {
            destination: destination?.position || { lat: 40.7629, lng: -111.8941 },
            destinationId: destination?.id,
            vehicleId
          }
        })

        steps.push({
          id: uuidv4(),
          stepNumber: 4,
          action: `Unload ${quantity} tons`,
          description: 'Unload materials at destination',
          estimatedDuration: 10,
          status: 'pending',
          parameters: {
            amount: quantity,
            destinationId: destination?.id,
            vehicleId
          }
        })

        estimatedDuration = 47
      }
    } else if (lowerInstruction.includes('clear') && lowerInstruction.includes('zone')) {
      // Zone clearing task
      priority = 'high'
      const sourceZone = mentionedPOIs.find(poi => poi.type === 'storage_zone') ||
                        await POI.findOne({ name: /Zone A/i })
      const targetZones = mentionedPOIs.filter(poi =>
        poi.type === 'storage_zone' && poi.id !== sourceZone?.id
      )

      if (sourceZone) {
        const materialToMove = sourceZone.currentAmount
        const trips = Math.ceil(materialToMove / vehicleCapacity)

        for (let trip = 1; trip <= trips; trip++) {
          const moveAmount = trip === trips
            ? materialToMove - (trip - 1) * vehicleCapacity
            : vehicleCapacity

          const targetZone = targetZones[trip % targetZones.length] || targetZones[0]

          steps.push({
            id: uuidv4(),
            stepNumber: steps.length + 1,
            action: `Move to ${sourceZone.name}`,
            description: `Navigate to source zone for clearing operation (trip ${trip})`,
            estimatedDuration: 8,
            status: 'pending',
            parameters: {
              destination: sourceZone.position,
              sourceId: sourceZone.id,
              vehicleId
            }
          })

          steps.push({
            id: uuidv4(),
            stepNumber: steps.length + 1,
            action: `Load ${moveAmount} tons from ${sourceZone.name}`,
            description: 'Load materials for relocation',
            estimatedDuration: 12,
            status: 'pending',
            parameters: {
              amount: moveAmount,
              sourceId: sourceZone.id,
              vehicleId
            }
          })

          steps.push({
            id: uuidv4(),
            stepNumber: steps.length + 1,
            action: `Transport to ${targetZone?.name || 'target zone'}`,
            description: 'Move materials to destination zone',
            estimatedDuration: 10,
            status: 'pending',
            parameters: {
              destination: targetZone?.position,
              destinationId: targetZone?.id,
              vehicleId
            }
          })

          steps.push({
            id: uuidv4(),
            stepNumber: steps.length + 1,
            action: `Unload at ${targetZone?.name || 'target zone'}`,
            description: 'Unload materials at destination',
            estimatedDuration: 8,
            status: 'pending',
            parameters: {
              amount: moveAmount,
              destinationId: targetZone?.id,
              vehicleId
            }
          })
        }

        estimatedDuration = trips * (8 + 12 + 10 + 8)
      }
    } else if (lowerInstruction.includes('fill') && lowerInstruction.includes('crusher')) {
      // Crusher filling task
      priority = 'medium'
      const crusher = mentionedPOIs.find(poi => poi.type === 'crusher') ||
                     await POI.findOne({ type: 'crusher' })

      for (const [_index, material] of mentionedMaterials.entries()) {
        const sourceZone = await POI.findOne({ materials: material })
        const materialAmount = quantity / mentionedMaterials.length

        steps.push({
          id: uuidv4(),
          stepNumber: steps.length + 1,
          action: `Collect ${material}`,
          description: `Move to source and load ${materialAmount} tons of ${material}`,
          estimatedDuration: 20,
          status: 'pending',
          parameters: {
            material,
            amount: materialAmount,
            sourceId: sourceZone?.id,
            destination: sourceZone?.position,
            vehicleId
          }
        })

        steps.push({
          id: uuidv4(),
          stepNumber: steps.length + 1,
          action: `Deliver ${material} to crusher`,
          description: `Transport and unload ${material} at crusher facility`,
          estimatedDuration: 18,
          status: 'pending',
          parameters: {
            material,
            amount: materialAmount,
            destinationId: crusher?.id,
            destination: crusher?.position,
            vehicleId
          }
        })
      }

      estimatedDuration = mentionedMaterials.length * 38
    } else {
      // Generic task decomposition
      steps.push({
        id: uuidv4(),
        stepNumber: 1,
        action: 'Analyze instruction',
        description: 'Process and understand the given instruction',
        estimatedDuration: 2,
        status: 'pending',
        parameters: { instruction, vehicleId }
      })

      steps.push({
        id: uuidv4(),
        stepNumber: 2,
        action: 'Execute operation',
        description: 'Perform the requested operation',
        estimatedDuration: 15,
        status: 'pending',
        parameters: { instruction, vehicleId }
      })

      steps.push({
        id: uuidv4(),
        stepNumber: 3,
        action: 'Report completion',
        description: 'Confirm task completion and update status',
        estimatedDuration: 3,
        status: 'pending',
        parameters: { instruction, vehicleId }
      })

      estimatedDuration = 20
    }

    return {
      steps,
      estimatedDuration,
      priority,
      summary: `Task decomposed into ${steps.length} steps with estimated duration of ${estimatedDuration} minutes`
    }
  }
}

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { status, vehicleId, priority } = req.query
    const filter = {}

    if (status) filter.status = status
    if (vehicleId) filter.vehicleId = vehicleId
    if (priority) filter.priority = priority

    const tasks = await Task.find(filter).sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

// Get specific task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ id: req.params.id })
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    res.status(500).json({ error: 'Failed to fetch task' })
  }
})

// Create new task with automatic decomposition
router.post('/', async (req, res) => {
  try {
    const { title, description, vehicleId, priority, originalInstruction, steps } = req.body

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    // Use description as originalInstruction if not provided
    const instruction = originalInstruction || description || title || 'Generic task'

    let taskSteps, taskPriority, taskDuration

    // If steps are provided, use them; otherwise decompose the task
    if (steps && steps.length > 0) {
      taskSteps = steps.map((step, index) => ({
        id: uuidv4(),
        stepNumber: index + 1,
        action: step.description || `Step ${index + 1}`,
        description: step.description || `Step ${index + 1}`,
        estimatedDuration: step.estimatedTime || 10,
        status: 'pending',
        parameters: {
          instruction,
          vehicleId: vehicleId || null
        }
      }))
      taskPriority = priority || 'medium'
      taskDuration = taskSteps.reduce((sum, step) => sum + step.estimatedDuration, 0)
    } else {
      // Decompose the task
      const decomposition = await TaskDecomposer.decomposeTask(instruction, vehicleId)
      taskSteps = decomposition.steps
      taskPriority = priority || decomposition.priority
      taskDuration = decomposition.estimatedDuration
    }

    const newTask = new Task({
      id: uuidv4(),
      title: title || `Auto-generated: ${instruction.substring(0, 50)}...`,
      description: description || instruction,
      vehicleId: vehicleId || null,
      status: 'pending_approval',
      priority: taskPriority,
      estimatedDuration: taskDuration,
      steps: taskSteps,
      originalInstruction: instruction,
      decompositionSummary: steps ? 'Manual steps provided' : 'Auto-decomposed'
    })

    await newTask.save()

    // Emit task creation to all clients
    const io = req.app.get('io')
    io.emit('task-created', newTask)
    console.log(`📋 [Task Created] Emitted task-created event: "${newTask.title}" (ID: ${newTask.id})`)

    res.status(201).json(newTask)
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Failed to create task' })
  }
})

// Approve or reject task plan
router.post('/:id/approval', async (req, res) => {
  try {
    const { approved, feedback } = req.body

    const task = await Task.findOne({ id: req.params.id })
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (approved) {
      task.status = 'approved'
      task.approvedAt = new Date()
      if (task.steps.length > 0) {
        task.steps[0].status = 'in_progress'
      }
      task.startedAt = new Date()
    } else {
      task.status = 'rejected'
      task.rejectedAt = new Date()
      task.feedback = feedback
    }

    await task.save()

    const io = req.app.get('io')
    io.emit('task-updated', task)
    console.log(`✅ [Task Approval] Emitted task-updated event: "${task.title}" status changed to ${task.status}`)

    res.json(task)
  } catch (error) {
    console.error('Error updating task approval:', error)
    res.status(500).json({ error: 'Failed to update task approval' })
  }
})

// Update task status or steps
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body

    const task = await Task.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true, runValidators: true }
    )

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const io = req.app.get('io')
    io.emit('task-updated', task)
    console.log(`📝 [Task Updated] Emitted task-updated event: "${task.title}" (ID: ${task.id})`)

    res.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    res.status(500).json({ error: 'Failed to update task' })
  }
})

// Complete a specific step
router.post('/:id/steps/:stepId/complete', async (req, res) => {
  try {
    const task = await Task.findOne({ id: req.params.id })
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const stepIndex = task.steps.findIndex(s => s.id === req.params.stepId)
    if (stepIndex === -1) {
      return res.status(404).json({ error: 'Step not found' })
    }

    // Mark current step as completed
    task.steps[stepIndex].status = 'completed'
    task.steps[stepIndex].completedAt = new Date()

    // Start next step if available
    const nextStepIndex = stepIndex + 1
    if (nextStepIndex < task.steps.length) {
      task.steps[nextStepIndex].status = 'in_progress'
    } else {
      // All steps completed
      task.status = 'completed'
      task.completedAt = new Date()
    }

    await task.save()

    const io = req.app.get('io')
    io.emit('task-updated', task)
    console.log(`🎯 [Step Completed] Emitted task-updated event: "${task.title}" step completed, status: ${task.status}`)

    res.json(task)
  } catch (error) {
    console.error('Error completing step:', error)
    res.status(500).json({ error: 'Failed to complete step' })
  }
})

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ id: req.params.id })
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const io = req.app.get('io')
    io.emit('task-deleted', task.id)
    console.log(`🗑️ [Task Deleted] Emitted task-deleted event: "${task.title}" (ID: ${task.id})`)

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

export default router

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import MapView from './components/MapView';
import VehiclePanel from './components/VehiclePanel';
import TaskModal from './components/TaskModal';
import { ApiService } from './services/ApiService';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [pois, setPois] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(BACKEND_URL);
    setSocket(socketInstance);

    // Load initial data
    loadInitialData();

    // Socket event listeners
    socketInstance.on('vehicle-update', (vehicle) => {
      setVehicles(prev => prev.map(v => v.id === vehicle.id ? vehicle : v));
    });

    socketInstance.on('poi-update', (poi) => {
      setPois(prev => prev.map(p => p.id === poi.id ? poi : p));
    });

    socketInstance.on('task-created', (task) => {
      setTasks(prev => [...prev, task]);
    });

    socketInstance.on('task-updated', (task) => {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    });

    socketInstance.on('task-deleted', (taskId) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, poisData, tasksData] = await Promise.all([
        ApiService.getVehicles(),
        ApiService.getPOIs(),
        ApiService.getTasks()
      ]);
      
      setVehicles(vehiclesData);
      setPois(poisData);
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      setError('Failed to load initial data. Please check your connection.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    if (socket && vehicle) {
      // Join the vehicle's socket room for real-time updates
      socket.emit('join-vehicle', vehicle.id);
    }
  };

  const handleCreateTask = () => {
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      await ApiService.createTask(taskData);
      setShowTaskModal(false);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading AI Machine Command Center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button onClick={loadInitialData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Machine Command Center</h1>
        <div className="header-stats">
          <span className="stat">
            <strong>{vehicles.length}</strong> Vehicles
          </span>
          <span className="stat">
            <strong>{pois.length}</strong> POIs
          </span>
          <span className="stat">
            <strong>{tasks.filter(t => t.status === 'pending_approval').length}</strong> Pending Tasks
          </span>
        </div>
        <button 
          className="create-task-btn"
          onClick={handleCreateTask}
        >
          Create New Task
        </button>
      </header>

      <main className="app-main">
        <div className="map-container">
          <MapView 
            vehicles={vehicles}
            pois={pois}
            selectedVehicle={selectedVehicle}
            onVehicleSelect={handleVehicleSelect}
            onVehicleUpdate={(vehicle) => {
              ApiService.updateVehicle(vehicle.id, vehicle);
            }}
          />
        </div>

        <div className="vehicle-panel-container">
          <VehiclePanel 
            vehicle={selectedVehicle}
            socket={socket}
            tasks={tasks.filter(t => t.vehicleId === selectedVehicle?.id)}
            onTaskApproval={(taskId, approved, feedback) => {
              ApiService.approveTask(taskId, approved, feedback);
            }}
            onStepComplete={(taskId, stepId) => {
              ApiService.completeTaskStep(taskId, stepId);
            }}
          />
        </div>
      </main>

      {showTaskModal && (
        <TaskModal
          vehicles={vehicles}
          onSubmit={handleTaskSubmit}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  );
}

export default App;

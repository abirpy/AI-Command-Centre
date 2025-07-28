import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

class ApiServiceClass {
  constructor() {
    this.api = axios.create({
      baseURL: `${BACKEND_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('API Error:', error);
        throw error;
      }
    );
  }

  // Vehicle endpoints
  async getVehicles() {
    return await this.api.get('/vehicles');
  }

  async getVehicle(id) {
    return await this.api.get(`/vehicles/${id}`);
  }

  async updateVehicle(id, vehicleData) {
    return await this.api.put(`/vehicles/${id}`, vehicleData);
  }

  async moveVehicle(id, destination) {
    return await this.api.post(`/vehicles/${id}/move`, { destination });
  }

  // POI endpoints
  async getPOIs() {
    return await this.api.get('/pois');
  }

  async getPOI(id) {
    return await this.api.get(`/pois/${id}`);
  }

  async updatePOI(id, poiData) {
    return await this.api.put(`/pois/${id}`, poiData);
  }

  // Task endpoints
  async getTasks() {
    return await this.api.get('/tasks');
  }

  async getTask(id) {
    return await this.api.get(`/tasks/${id}`);
  }

  async createTask(taskData) {
    return await this.api.post('/tasks', taskData);
  }

  async updateTask(id, taskData) {
    return await this.api.put(`/tasks/${id}`, taskData);
  }

  async approveTask(id, approved, feedback = '') {
    return await this.api.post(`/tasks/${id}/approval`, { approved, feedback });
  }

  async completeTaskStep(taskId, stepId) {
    return await this.api.post(`/tasks/${taskId}/steps/${stepId}/complete`);
  }

  async deleteTask(id) {
    return await this.api.delete(`/tasks/${id}`);
  }

  // Chat endpoints
  async getChatMessages(vehicleId) {
    return await this.api.get(`/chat/${vehicleId}`);
  }

  async sendChatMessage(vehicleId, message, sender) {
    return await this.api.post(`/chat/${vehicleId}`, { message, sender });
  }

  async getAIResponse(vehicleId, userMessage) {
    return await this.api.post(`/chat/${vehicleId}/ai-response`, { userMessage });
  }

  // Health check
  async healthCheck() {
    return await this.api.get('/health');
  }
}

export const ApiService = new ApiServiceClass(); 
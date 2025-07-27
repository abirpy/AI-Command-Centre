# AI Machine Command Center

A comprehensive React/Vite frontend with Express backend system for managing AI-powered mining vehicles, featuring real-time communication, task decomposition, and interactive mapping.

## 🎯 Project Overview

This project was developed as an interview case study demonstrating:

- **Real-time vehicle tracking** with interactive map visualization
- **AI-powered task decomposition** that breaks down complex instructions into manageable steps
- **Natural language processing** for intuitive command input
- **Real-time communication** between operators and vehicles
- **Task approval workflow** with accept/reject functionality
- **Modern, responsive UI/UX** design

## 🏗️ Architecture

### Backend (Express + Socket.IO)

- **API Routes**: REST endpoints for vehicles, POIs, tasks, and chat
- **Task Decomposition Engine**: AI-powered system that analyzes natural language instructions
- **Real-time Communication**: Socket.IO for live updates and chat functionality
- **Mock Data**: Realistic mining operation simulation

### Frontend (React + Vite)

- **Interactive Map**: Leaflet-based mapping with custom vehicle and POI markers
- **Vehicle Panel**: Detailed vehicle information with real-time stats and chat
- **Task Management**: Create, approve, and monitor task execution
- **Task Visualization**: Step-by-step breakdown with progress tracking
- **Responsive Design**: Optimized for desktop and mobile devices

## 🚀 Features

### 1. Interactive Map View

- Real-time vehicle positions and status indicators
- Points of Interest (POIs) including storage zones, crushers, and loading docks
- Vehicle route visualization for moving vehicles
- Click-to-select vehicle interaction

### 2. AI Task Decomposition

Automatically breaks down complex instructions like:

- _"Load 150 tons of Material A and transport it to the crusher"_
- _"Clear Zone A by moving all material to Zone B or C"_
- _"Fill the crusher with a mixture of Material A and Material B"_

Into detailed step-by-step plans considering:

- Vehicle capacity limitations
- Multiple trips when needed
- Optimal routing
- Time estimations

### 3. Vehicle Communication

- Real-time chat interface with AI responses
- Quick command suggestions
- Message history persistence
- Socket.IO powered real-time updates

### 4. Task Management Workflow

1. **Create**: Natural language task input with examples
2. **Decompose**: AI automatically creates step-by-step plan
3. **Approve/Reject**: Operator reviews and approves the plan
4. **Execute**: Step-by-step execution with progress tracking
5. **Monitor**: Real-time status updates and completion tracking

## 🛠️ Technology Stack

### Backend

- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - Logging middleware

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Leaflet** - Interactive mapping
- **Leaflet** - Map visualization library
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-machine-command-center
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Start the Development Servers

**Backend** (Terminal 1):

```bash
cd backend
npm run dev
```

Server will start on `http://localhost:3001`

**Frontend** (Terminal 2):

```bash
cd frontend
npm run dev
```

Application will start on `http://localhost:5173`

## 🎮 Usage Guide

### 1. Exploring the Map

- View all vehicles and POIs on the interactive map
- Click on vehicles to see details and select them
- Observe vehicle routes for moving vehicles
- Check the legend for vehicle status indicators

### 2. Vehicle Selection

- Click on a vehicle marker on the map
- The right panel will show detailed vehicle information
- View real-time stats: battery, load, position, last update
- Access the chat interface for communication

### 3. Creating Tasks

1. Click "Create New Task" in the header
2. Enter a natural language instruction (use examples for reference)
3. Preview the AI decomposition (optional)
4. Assign to a specific vehicle or auto-assign
5. Submit the task

### 4. Task Approval

1. Review the decomposed task steps
2. Check estimated duration and complexity
3. Click "Approve" to start execution or "Reject" to cancel
4. Monitor progress in real-time

### 5. Vehicle Communication

- Send messages to vehicles via the chat interface
- Use quick command suggestions for common operations
- Receive AI-powered responses from vehicles
- View message history

## 🎯 Example Tasks

Try these natural language commands:

1. **Load and Transport**:

   ```
   Load 150 tons of Material A and transport it to the crusher
   ```

2. **Zone Clearing**:

   ```
   Clear Zone A by moving all material to Zone B or C
   ```

3. **Material Mixing**:

   ```
   Fill the crusher with a mixture of Material A and Material B
   ```

4. **Custom Operations**:
   ```
   Load 200 tons of Material B and distribute between Zone B and Zone C
   ```

## 🔧 Configuration

### Backend Configuration

The backend can be configured via environment variables:

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)

### Frontend Configuration

Frontend environment variables:

- `VITE_BACKEND_URL`: Backend API URL (default: http://localhost:3001)

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Desktop**: Full dual-panel layout with map and vehicle panel
- **Tablet**: Stacked layout with collapsible sections
- **Mobile**: Single-column layout with touch-optimized controls

## 🏭 Mining Operations Simulation

The system simulates a realistic mining operation with:

### Vehicles

- **Haul Trucks**: 100-ton capacity transport vehicles
- **Excavators**: 50-ton capacity digging equipment
- **Loaders**: 75-ton capacity loading machinery

### Points of Interest

- **Storage Zones**: Material storage areas (Zone A, B, C)
- **Crusher**: Material processing facility
- **Loading Docks**: Material pickup locations

### Materials

- **Material A**: Primary ore material (2.5 tons/m³ density)
- **Material B**: Secondary processing material (1.8 tons/m³ density)

## 🧪 Task Decomposition Examples

### Simple Transport (Single Trip)

**Input**: "Load 80 tons of Material A and transport it to the crusher"

**Output**:

1. Move to Zone A - Material A Storage (10 min)
2. Load 80 tons of Material A (15 min)
3. Transport to Primary Crusher (12 min)
4. Unload 80 tons (10 min)

### Complex Transport (Multiple Trips)

**Input**: "Load 150 tons of Material A and transport it to the crusher"

**Output**:

1. Move to Zone A - Material A Storage (10 min)
2. Load 100 tons of Material A (1/2 trips) (15 min)
3. Transport to Primary Crusher (12 min)
4. Unload 100 tons (10 min)
5. Move to Zone A - Material A Storage (10 min)
6. Load 50 tons of Material A (2/2 trips) (15 min)
7. Transport to Primary Crusher (12 min)
8. Unload 50 tons (10 min)

## 🚨 Error Handling

The system includes comprehensive error handling:

- **Network errors**: Automatic retry with user feedback
- **Invalid tasks**: Clear error messages and suggestions
- **Connection loss**: Reconnection attempts and status indicators
- **Data validation**: Input validation with helpful error messages

## 🔮 Future Enhancements

Potential improvements for production deployment:

1. **Real AI Integration**: Connect to actual AI/ML services
2. **3D Visualization**: Three-dimensional mine site representation
3. **Historical Analytics**: Task performance and efficiency metrics
4. **Multi-site Support**: Multiple mining locations
5. **Role-based Access**: Different permission levels for operators
6. **Offline Capability**: Local caching and sync when reconnected
7. **Integration APIs**: Connect to existing mine management systems

## 🤝 Contributing

This is a demonstration project for interview purposes. For production use, consider:

- Adding comprehensive testing (unit, integration, e2e)
- Implementing proper authentication and authorization
- Adding database persistence
- Setting up CI/CD pipelines
- Adding monitoring and logging
- Implementing proper error tracking

## 📄 License

This project is created for demonstration purposes. Feel free to use as reference or starting point for similar projects.

## 🙋‍♂️ Contact

Created as an interview case study demonstrating full-stack development capabilities with modern technologies and AI integration.

---

**Note**: This is a demonstration project with mock data. In a production environment, you would integrate with real vehicle systems, GPS tracking, and industrial IoT devices.

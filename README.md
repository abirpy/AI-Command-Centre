# AI Machine Command Center

A comprehensive React/Vite frontend with Express backend system for managing AI-powered mining vehicles, featuring real-time communication, task decomposition, and interactive mapping.

## 🌐 Live Production Deployment

- **Frontend**: [https://ai-command-centre.vercel.app](https://ai-command-centre.vercel.app)
- **Backend API**: [https://ai-command-centre-production.up.railway.app](https://ai-command-centre-production.up.railway.app)
- **Database**: MongoDB Atlas (Cloud-hosted)

## 🎯 Project Overview

This project was developed as an interview case study demonstrating:

- **Real-time vehicle tracking** with interactive map visualization
- **AI-powered task decomposition** that breaks down complex instructions into manageable steps
- **Natural language processing** for intuitive command input
- **Real-time communication** between operators and vehicles
- **Task approval workflow** with accept/reject functionality
- **Modern, responsive UI/UX** design
- **Full-stack deployment** on cloud platforms

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI MACHINE COMMAND CENTER                    │
│                    Vehicle Fleet Management System              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │◄──►│   DATABASE      │
│   (React/Vite)  │    │  (Node.js/      │    │  (MongoDB       │
│                 │    │   Express)      │    │   Atlas)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │    │   Cloud         │
│   (Hosting)     │    │   (Hosting)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Backend (Express + Socket.IO)

- **API Routes**: REST endpoints for vehicles, POIs, tasks, and chat
- **Task Decomposition Engine**: AI-powered system that analyzes natural language instructions
- **Real-time Communication**: Socket.IO for live updates and chat functionality
- **Mock Data**: Realistic mining operation simulation
- **Security**: Multi-layered security with Helmet.js, CORS, and rate limiting

### Frontend (React + Vite)

- **Interactive Map**: Leaflet-based mapping with custom vehicle and POI markers
- **Vehicle Panel**: Detailed vehicle information with real-time stats and chat
- **Task Management**: Create, approve, and monitor task execution
- **Task Visualization**: Step-by-step breakdown with progress tracking
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Technology Stack

| Layer           | Technology                                | Purpose                                  |
| --------------- | ----------------------------------------- | ---------------------------------------- |
| **Frontend**    | React 19 + Vite 7.0.4                     | Modern UI framework with fast build tool |
| **Maps**        | Leaflet 1.9.4 + React-Leaflet 5.0.0       | Interactive mapping solution             |
| **Real-time**   | Socket.IO 4.8.1                           | Live communication and updates           |
| **HTTP Client** | Axios 1.11.0                              | API communication                        |
| **Icons**       | Lucide React 0.525.0                      | Modern icon library                      |
| **Backend**     | Node.js + Express.js 5.1.0                | RESTful API and real-time server         |
| **Database**    | MongoDB + Mongoose 8.16.4                 | Flexible document storage                |
| **Security**    | Helmet 8.1.0 + CORS 2.8.5 + Rate Limiting | Multi-layered security                   |
| **Deployment**  | Vercel + Railway + MongoDB Atlas          | Cloud hosting with auto-scaling          |

## 🌐 Deployment Architecture

### Production Environment

- **Frontend Hosting**: Vercel with global CDN and auto-scaling
- **Backend Hosting**: Railway with load balancing and dedicated resources
- **Database**: MongoDB Atlas with automatic scaling and backups

### Environment Configuration

- **VITE_BACKEND_URL**: Frontend-backend communication
- **MONGODB_URI**: Database connection string
- **CORS_ORIGIN**: Cross-origin security settings
- **PORT**: Server configuration

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

## 🔒 Security Implementation

### Security Layers

- **Helmet.js**: Security headers and XSS protection
- **CORS Configuration**: Controlled cross-origin access with dynamic origin validation
- **Rate Limiting**: Request throttling (100 requests per 15-minute window)
- **Input Validation**: Data sanitization and type validation
- **Environment Variables**: Secure configuration management

## 📈 Performance & Scalability

### Performance Optimizations

- ✅ Vite build tool for fast development and optimized production builds
- ✅ React component optimization and memoization
- ✅ Database indexing for fast queries
- ✅ CDN delivery for global content distribution
- ✅ Browser and server-side caching strategies

### Scalability Features

- ✅ Stateless backend design for horizontal scaling
- ✅ Load balancing through Railway
- ✅ MongoDB Atlas automatic scaling
- ✅ Microservices-ready modular architecture
- ✅ Cloud infrastructure with auto-scaling

## 📦 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-machine-command-center
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Environment Variables

Create `.env` files in both `client/` and `server/` directories:

**Server (.env)**:

```
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
PORT=3001
```

**Client (.env)**:

```
VITE_BACKEND_URL=http://localhost:3001
```

### 5. Start the Development Servers

**Backend** (Terminal 1):

```bash
cd server
npm run dev
```

Server will start on `http://localhost:3001`

**Frontend** (Terminal 2):

```bash
cd client
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

## 📊 Data Models

### Vehicle Schema

```javascript
{
  id: String,
  name: String,
  type: String,
  status: String,
  location: { lat: Number, lng: Number },
  currentTask: String,
  assignedTasks: [String],
  specifications: Object
}
```

### Task Schema

```javascript
{
  id: String,
  title: String,
  description: String,
  status: String,
  priority: String,
  assignedVehicle: String,
  location: Object,
  steps: [Object],
  dueDate: Date
}
```

### POI Schema

```javascript
{
  id: String,
  name: String,
  type: String,
  description: String,
  location: Object,
  materials: [String],
  capacity: Number,
  currentAmount: Number,
  status: String
}
```

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

## 🚀 Key Achievements

1. **✅ Full-Stack Development**: Complete React + Node.js application
2. **✅ Real-time Features**: Socket.IO implementation for live updates
3. **✅ Cloud Deployment**: Successfully deployed on Vercel + Railway
4. **✅ Database Integration**: MongoDB Atlas with proper schema design
5. **✅ Security Implementation**: Multi-layered security approach
6. **✅ Performance Optimization**: Fast loading and efficient operations
7. **✅ Responsive Design**: Mobile-friendly interface
8. **✅ Production Ready**: Live application with real data

---

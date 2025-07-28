import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Battery, 
  Truck, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  Settings
} from 'lucide-react';
import { ApiService } from '../services/ApiService';
import TaskSteps from './TaskSteps';

const VehiclePanel = ({ 
  vehicle, 
  socket, 
  tasks, 
  onTaskApproval, 
  onStepComplete 
}) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const vehiclePanelRef = useRef(null);

  // Scroll to top when vehicle selection changes
  useEffect(() => {
    if (vehicle && vehiclePanelRef.current) {
      const scrollableContainer = vehiclePanelRef.current.closest('.vehicle-panel-container');
      
      if (scrollableContainer) {
        const scrollToTop = () => {
          scrollableContainer.scrollTop = 0;
          scrollableContainer.scrollTo({
            top: 0,
            behavior: 'instant' 
          });
        };
        
        // Try immediately
        scrollToTop();
        
        // Try again after React re-render
        setTimeout(scrollToTop, 50);
        
        // Final attempt after all effects settle
        setTimeout(scrollToTop, 200);
        
      } else {
        // Fallback: try to find it by class name
        const container = document.querySelector('.vehicle-panel-container');
        if (container) {
          const scrollToTop = () => {
            container.scrollTop = 0;
            container.scrollTo({
              top: 0,
              behavior: 'instant'
            });
          };
          
          scrollToTop();
          setTimeout(scrollToTop, 50);
          setTimeout(scrollToTop, 200);
        }
      }
    }
  }, [vehicle?.id]); // Only trigger when vehicle ID changes

  useEffect(() => {
    if (vehicle && socket) {
      loadChatMessages();
      
      // Listen for new messages
      socket.on('new-message', (message) => {
        if (message.vehicleId === vehicle.id) {
          setChatMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      });

      return () => {
        socket.off('new-message');
      };
    }
  }, [vehicle, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const loadChatMessages = async () => {
    if (!vehicle) return;
    
    try {
      setIsLoadingMessages(true);
      const messages = await ApiService.getChatMessages(vehicle.id);
      setChatMessages(messages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !vehicle || isSending) return;

    try {
      setIsSending(true);
      
      // Send the user message
      await ApiService.sendChatMessage(vehicle.id, newMessage, 'operator');
      
      // Get AI response
      setTimeout(async () => {
        try {
          await ApiService.getAIResponse(vehicle.id, newMessage);
        } catch (error) {
          console.error('Error getting AI response:', error);
        }
      }, 1000); // Delay for realism

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'idle': return '#22c55e';
      case 'moving': return '#3b82f6';
      case 'working': return '#f59e0b';
      case 'charging': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getBatteryColor = (level) => {
    if (level > 60) return '#22c55e';
    if (level > 30) return '#f59e0b';
    return '#ef4444';
  };

  const getVehicleTypeDisplay = (type) => {
    switch (type) {
      case 'haul_truck': return 'Haul Truck';
      case 'excavator': return 'Excavator';
      case 'loader': return 'Loader';
      default: return 'Vehicle';
    }
  };

  if (!vehicle) {
    return (
      <div className="vehicle-panel no-selection">
        <div className="no-selection-content">
          <Truck size={48} color="#9ca3af" />
          <h3>No Vehicle Selected</h3>
          <p>Click on a vehicle marker on the map to view details, monitor status, and start communication.</p>
          <div className="selection-hint">
            <p className="hint-text">💡 You can also click on POIs to view facility information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-panel" ref={vehiclePanelRef}>
      {/* Vehicle Header */}
      <div className="vehicle-header">
        <div className="vehicle-title">
          <Truck size={24} />
          <div>
            <h2>{vehicle.name}</h2>
            <span className="vehicle-type">{getVehicleTypeDisplay(vehicle.type)}</span>
          </div>
        </div>
        <div 
          className="vehicle-status"
          style={{ backgroundColor: getStatusColor(vehicle.status) }}
        >
          {vehicle.status}
        </div>
      </div>

      {/* Vehicle Stats */}
      <div className="vehicle-stats">
        <div className="stat-card">
          <Battery size={20} />
          <div>
            <span className="stat-label">Battery</span>
            <span 
              className="stat-value"
              style={{ color: getBatteryColor(vehicle.batteryLevel) }}
            >
              {vehicle.batteryLevel}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <Settings size={20} />
          <div>
            <span className="stat-label">Load</span>
            <span className="stat-value">
              {vehicle.currentLoad}/{vehicle.capacity} tons
            </span>
          </div>
        </div>

        <div className="stat-card">
          <MapPin size={20} />
          <div>
            <span className="stat-label">Position</span>
            <span className="stat-value">
              {vehicle.position.lat.toFixed(4)}, {vehicle.position.lng.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <Clock size={20} />
          <div>
            <span className="stat-label">Last Update</span>
            <span className="stat-value">
              {formatTime(vehicle.lastUpdate)}
            </span>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      {tasks && tasks.filter(task => ['pending_approval', 'approved', 'in_progress'].includes(task.status)).length > 0 && (
        <div className="tasks-section">
          <h3>Active Tasks</h3>
          <div className="tasks-list">
            {tasks.filter(task => ['pending_approval', 'approved', 'in_progress'].includes(task.status)).map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <h4>{task.title}</h4>
                  <span className={`task-status ${task.status}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="task-description">{task.description}</p>
                
                {task.status === 'pending_approval' && (
                  <div className="task-approval">
                    <p><strong>Proposed Plan:</strong></p>
                    <TaskSteps steps={task.steps} />
                    <div className="approval-buttons">
                      <button 
                        className="approve-btn"
                        onClick={() => onTaskApproval(task.id, true)}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => onTaskApproval(task.id, false, 'Rejected by operator')}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {(task.status === 'approved' || task.status === 'in_progress') && (
                  <TaskSteps 
                    steps={task.steps} 
                    onStepComplete={(stepId) => onStepComplete(task.id, stepId)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Section */}
      <div className="chat-section">
        <div className="chat-header">
          <MessageCircle size={20} />
          <h3>Vehicle Communication</h3>
        </div>

        <div 
          className="chat-messages" 
          ref={chatContainerRef}
        >
          {isLoadingMessages ? (
            <div className="loading-messages">Loading messages...</div>
          ) : (
            <>
              {chatMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender}`}
                >
                  <div className="message-content">
                    <span className="message-text">{message.message}</span>
                    <span className="message-time">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <div className="chat-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a command or message..."
              className="chat-input"
              disabled={isSending}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <div className="loading-spinner small" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </form>

        <div className="chat-suggestions">
          <h4>Quick Commands:</h4>
          <div className="suggestion-buttons">
            {[
              'What is your current status?',
              'Move to loading zone',
              'Check battery level',
              'Stop current operation'
            ].map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-btn"
                onClick={() => setNewMessage(suggestion)}
                disabled={isSending}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclePanel; 
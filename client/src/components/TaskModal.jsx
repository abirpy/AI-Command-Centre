import React, { useState } from 'react';
import { X, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const TaskModal = ({ vehicles, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalInstruction: '',
    vehicleId: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const exampleInstructions = [
    'Load 150 tons of Material A and transport it to the crusher',
    'Clear Zone A by moving all material to Zone B or C',
    'Fill the crusher with a mixture of Material A and Material B',
    'Move to loading dock and pick up 100 tons of Material A',
    'Transport all materials from Zone A to the primary crusher',
    'Load 200 tons of Material B and distribute between Zone B and Zone C'
  ];

  const handleInputChange = (field, value) => {
    // Auto-generate title and description from instruction
    if (field === 'originalInstruction' && value.trim()) {
      const shortTitle = value.length > 50 ? value.substring(0, 50) + '...' : value;
      
      setFormData(prev => ({
        ...prev,
        [field]: value,
        // Only auto-update title if it's empty or auto-generated (starts with "Task: ")
        title: (!prev.title || prev.title.startsWith('Task: ')) ? `Task: ${shortTitle}` : prev.title,
        description: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePreview = async () => {
    if (!formData.originalInstruction.trim()) {
      alert('Please enter a task instruction first.');
      return;
    }

    setShowPreview(true);
    // In a real implementation, this would call the backend to get the task decomposition preview
    setPreview({
      steps: [
        { action: 'Analyzing instruction...', description: 'Processing natural language command' },
        { action: 'Planning route...', description: 'Calculating optimal path' },
        { action: 'Estimating duration...', description: 'Computing time requirements' }
      ],
      estimatedDuration: '~45 minutes',
      complexity: 'Medium'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.originalInstruction.trim()) {
      alert('Please enter a task instruction.');
      return;
    }

    if (!formData.vehicleId) {
      alert('Please select a vehicle for this task.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectExample = (instruction) => {
    handleInputChange('originalInstruction', instruction);
    setShowPreview(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content task-modal">
        <div className="modal-header">
          <h2>Create New Task</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-section">
            <h3>Task Instruction</h3>
            <div className="form-group">
              <label htmlFor="instruction">
                Natural Language Command
                <span className="label-hint">
                  Describe what you want the vehicle to do in plain English
                </span>
              </label>
              <textarea
                id="instruction"
                value={formData.originalInstruction}
                onChange={(e) => handleInputChange('originalInstruction', e.target.value)}
                placeholder="e.g., Load 150 tons of Material A and transport it to the crusher"
                className="instruction-input"
                rows={3}
                required
              />
            </div>

            <div className="example-instructions">
              <h4>Example Instructions:</h4>
              <div className="examples-grid">
                {exampleInstructions.map((instruction, index) => (
                  <button
                    key={index}
                    type="button"
                    className="example-btn"
                    onClick={() => selectExample(instruction)}
                  >
                    {instruction}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Task Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Task Title</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Auto-generated from instruction"
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="vehicle">Assign to Vehicle *</label>
              <select
                id="vehicle"
                value={formData.vehicleId}
                onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                required
              >
                <option value="">Select a vehicle...</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.type} - {vehicle.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional details about the task"
                rows={2}
              />
            </div>
          </div>

          {showPreview && preview && (
            <div className="form-section preview-section">
              <h3>Task Preview</h3>
              <div className="task-preview">
                <div className="preview-header">
                  <div className="preview-stat">
                    <span className="stat-label">Steps:</span>
                    <span className="stat-value">{preview.steps.length}</span>
                  </div>
                  <div className="preview-stat">
                    <span className="stat-label">Duration:</span>
                    <span className="stat-value">{preview.estimatedDuration}</span>
                  </div>
                  <div className="preview-stat">
                    <span className="stat-label">Complexity:</span>
                    <span className="stat-value">{preview.complexity}</span>
                  </div>
                </div>
                <div className="preview-steps">
                  {preview.steps.map((step, index) => (
                    <div key={index} className="preview-step">
                      <span className="step-number">{index + 1}</span>
                      <div>
                        <div className="step-action">{step.action}</div>
                        <div className="step-description">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="preview-note">
                  <AlertTriangle size={16} />
                  <span>This is a preview. Actual decomposition will occur after submission.</span>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="preview-btn"
              onClick={handlePreview}
              disabled={!formData.originalInstruction.trim() || !formData.vehicleId || isSubmitting}
            >
              <Zap size={16} />
              Preview AI Decomposition
            </button>
            
            <div className="action-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={!formData.originalInstruction.trim() || !formData.vehicleId || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner small" />
                    Creating Task...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Create Task
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal; 
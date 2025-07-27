import React from 'react';
import { 
  CheckCircle, 
  Circle, 
  Play, 
  Clock, 
  MapPin, 
  Package, 
  Truck 
} from 'lucide-react';

const TaskSteps = ({ steps, onStepComplete }) => {
  const getStepIcon = (action) => {
    if (action.toLowerCase().includes('move') || action.toLowerCase().includes('transport')) {
      return <Truck size={16} />;
    }
    if (action.toLowerCase().includes('load') || action.toLowerCase().includes('unload')) {
      return <Package size={16} />;
    }
    if (action.toLowerCase().includes('position')) {
      return <MapPin size={16} />;
    }
    return <Circle size={16} />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'in_progress':
        return '#3b82f6';
      case 'pending':
      default:
        return '#9ca3af';
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const totalDuration = steps.reduce((sum, step) => sum + step.estimatedDuration, 0);

  if (!steps || steps.length === 0) {
    return (
      <div className="task-steps">
        <p className="no-steps">No steps defined for this task.</p>
      </div>
    );
  }

  return (
    <div className="task-steps">
      <div className="steps-header">
        <div className="steps-summary">
          <span className="steps-count">{steps.length} steps</span>
          <span className="steps-duration">
            <Clock size={14} />
            {formatDuration(totalDuration)}
          </span>
        </div>
      </div>

      <div className="steps-list">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`step-item ${step.status}`}
          >
            <div className="step-indicator">
              <div className="step-number">
                {step.status === 'completed' ? (
                  <CheckCircle size={16} />
                ) : (
                  <span>{step.stepNumber}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className="step-connector"
                  style={{ 
                    backgroundColor: step.status === 'completed' ? 
                      getStatusColor('completed') : 
                      getStatusColor('pending') 
                  }}
                />
              )}
            </div>

            <div className="step-content">
              <div className="step-header">
                <div className="step-action">
                  {getStepIcon(step.action)}
                  <h4>{step.action}</h4>
                </div>
                <div className="step-meta">
                  <span 
                    className={`step-status ${step.status}`}
                    style={{ backgroundColor: getStatusColor(step.status) }}
                  >
                    {step.status.replace('_', ' ')}
                  </span>
                  <span className="step-duration">
                    {formatDuration(step.estimatedDuration)}
                  </span>
                </div>
              </div>

              <p className="step-description">{step.description}</p>

              {step.parameters && (
                <div className="step-parameters">
                  {step.parameters.destination && (
                    <div className="parameter">
                      <MapPin size={12} />
                      <span>
                        Destination: {step.parameters.destination.lat?.toFixed(4)}, 
                        {step.parameters.destination.lng?.toFixed(4)}
                      </span>
                    </div>
                  )}
                  {step.parameters.material && (
                    <div className="parameter">
                      <Package size={12} />
                      <span>Material: {step.parameters.material}</span>
                    </div>
                  )}
                  {step.parameters.amount && (
                    <div className="parameter">
                      <span>Amount: {step.parameters.amount} tons</span>
                    </div>
                  )}
                </div>
              )}

              {step.status === 'in_progress' && onStepComplete && (
                <div className="step-actions">
                  <button 
                    className="complete-step-btn"
                    onClick={() => onStepComplete(step.id)}
                  >
                    <CheckCircle size={16} />
                    Complete Step
                  </button>
                </div>
              )}

              {step.completedAt && (
                <div className="step-completion">
                  <span className="completion-time">
                    Completed at {new Date(step.completedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="steps-footer">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
            }}
          />
        </div>
        <div className="progress-text">
          {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed
        </div>
      </div>
    </div>
  );
};

export default TaskSteps; 
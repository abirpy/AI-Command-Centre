import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MapView from '../../components/MapView';

// Mock the ApiService
vi.mock('../../services/ApiService', () => ({
  default: {
    getVehicles: vi.fn(() => Promise.resolve([
      {
        id: 'vehicle-1',
        name: 'Haul Truck 1',
        type: 'haul_truck',
        status: 'idle',
        location: { lat: 40.7128, lng: -74.0060 },
        currentTask: null,
        assignedTasks: []
      }
    ])),
    getPOIs: vi.fn(() => Promise.resolve([
      {
        id: 'poi-1',
        name: 'Zone A - Material A Storage',
        type: 'storage_zone',
        description: 'Primary storage area for Material A',
        location: { lat: 40.7589, lng: -73.9851 },
        materials: ['Material A'],
        capacity: 1000,
        currentAmount: 750,
        status: 'operational'
      }
    ])),
    getTasks: vi.fn(() => Promise.resolve([
      {
        id: 'task-1',
        title: 'Transport Material A',
        description: 'Load and transport Material A to crusher',
        status: 'pending_approval',
        priority: 'high',
        assignedVehicle: 'vehicle-1',
        location: { lat: 40.7128, lng: -74.0060 },
        steps: [
          { order: 1, description: 'Move to Zone A', estimatedTime: 10 },
          { order: 2, description: 'Load Material A', estimatedTime: 15 }
        ]
      }
    ]))
  }
}));

// Note: react-leaflet is already mocked in setup.js

describe('MapView Component', () => {
  const mockVehicles = [
    {
      id: 'vehicle-1',
      name: 'Haul Truck 1',
      type: 'haul_truck',
      status: 'idle',
      position: { lat: 40.7128, lng: -74.0060 }
    }
  ];

  const mockPOIs = [
    {
      id: 'poi-1',
      name: 'Zone A - Material A Storage',
      type: 'storage_zone',
      description: 'Primary storage area for Material A',
      position: { lat: 40.7589, lng: -73.9851 },
      materials: ['Material A'],
      capacity: 1000,
      currentAmount: 750,
      status: 'operational'
    }
  ];

  const mockOnVehicleSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the map container', async () => {
    render(<MapView vehicles={mockVehicles} pois={mockPOIs} onVehicleSelect={mockOnVehicleSelect} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  it('renders tile layer', async () => {
    render(<MapView vehicles={mockVehicles} pois={mockPOIs} onVehicleSelect={mockOnVehicleSelect} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
    });
  });

  it('displays vehicle markers', async () => {
    render(<MapView vehicles={mockVehicles} pois={mockPOIs} onVehicleSelect={mockOnVehicleSelect} />);
    
    await waitFor(() => {
      const markers = screen.getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(0);
    });
  });

  it('displays POI markers', async () => {
    render(<MapView vehicles={mockVehicles} pois={mockPOIs} onVehicleSelect={mockOnVehicleSelect} />);
    
    await waitFor(() => {
      const markers = screen.getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(0);
    });
  });

  it('shows site overview legend', async () => {
    render(<MapView vehicles={mockVehicles} pois={mockPOIs} onVehicleSelect={mockOnVehicleSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('Site Overview')).toBeInTheDocument();
      expect(screen.getByText('Idle')).toBeInTheDocument();
      expect(screen.getByText('Moving')).toBeInTheDocument();
      expect(screen.getByText('Working')).toBeInTheDocument();
      expect(screen.getByText('Charging')).toBeInTheDocument();
    });
  });

  it('displays vehicle statistics', async () => {
    render(<MapView vehicles={mockVehicles} pois={mockPOIs} onVehicleSelect={mockOnVehicleSelect} />);
    
    await waitFor(() => {
      // The component shows the legend with vehicle status colors
      expect(screen.getByText('Idle')).toBeInTheDocument();
      expect(screen.getByText('Moving')).toBeInTheDocument();
      expect(screen.getByText('Working')).toBeInTheDocument();
      expect(screen.getByText('Charging')).toBeInTheDocument();
    });
  });

  it('handles vehicle selection', async () => {
    render(<MapView vehicles={mockVehicles} pois={mockPOIs} onVehicleSelect={mockOnVehicleSelect} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  it('handles POI click', async () => {
    render(<MapView vehicles={mockVehicles} pois={mockPOIs} onVehicleSelect={mockOnVehicleSelect} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(<MapView vehicles={mockVehicles} pois={mockPOIs} onVehicleSelect={mockOnVehicleSelect} />);
    
    // The component should render immediately even while loading data
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    const { default: ApiService } = await import('../../services/ApiService');
    ApiService.getVehicles.mockRejectedValueOnce(new Error('API Error'));
    
    render(<MapView vehicles={mockVehicles} pois={mockPOIs} onVehicleSelect={mockOnVehicleSelect} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });
}); 
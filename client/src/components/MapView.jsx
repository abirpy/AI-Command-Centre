import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different vehicle types
const createVehicleIcon = (type, status) => {
  const colors = {
    idle: '#22c55e',      // green
    moving: '#3b82f6',    // blue  
    working: '#f59e0b',   // amber
    charging: '#ef4444'   // red
  };

  const iconSize = type === 'haul_truck' ? [32, 32] : [28, 28];
  
  return L.divIcon({
    html: `<div style="background-color: ${colors[status] || colors.idle}; 
                      width: ${iconSize[0]}px; height: ${iconSize[1]}px; 
                      border-radius: 50%; 
                      border: 3px solid white;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-size: 16px;">
              ${type === 'haul_truck' ? '🚛' : type === 'excavator' ? '🚜' : '🏗️'}
           </div>`,
    className: 'custom-vehicle-icon',
    iconSize: iconSize,
    iconAnchor: [iconSize[0]/2, iconSize[1]/2]
  });
};

// Custom icons for POIs
const createPOIIcon = (type) => {
  const icons = {
    storage_zone: { emoji: '📦', color: '#8b5cf6' },
    crusher: { emoji: '⚙️', color: '#dc2626' },
    loading_dock: { emoji: '🏭', color: '#059669' }
  };

  const config = icons[type] || icons.storage_zone;
  
  return L.divIcon({
    html: `<div style="background-color: ${config.color}; 
                      width: 36px; height: 36px; 
                      border-radius: 8px;
                      border: 2px solid white;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-size: 18px;">
              ${config.emoji}
           </div>`,
    className: 'custom-poi-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

const MapView = ({ 
  vehicles, 
  pois, 
  selectedVehicle, 
  onVehicleSelect, 
}) => {
  const mapRef = useRef();

  useEffect(() => {
    // Pan to selected vehicle when selection changes
    if (selectedVehicle && mapRef.current) {
      mapRef.current.setView(
        [selectedVehicle.position.lat, selectedVehicle.position.lng], 
        15
      );
    }
  }, [selectedVehicle]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'idle': return '#22c55e';
      case 'moving': return '#3b82f6';
      case 'working': return '#f59e0b';
      case 'charging': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="map-view">
      <div className="map-header">
        <h2>Site Overview</h2>
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#22c55e' }}></div>
            <span>Idle</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Moving</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Working</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Charging</span>
          </div>
        </div>
      </div>

      <MapContainer
        ref={mapRef}
        center={[40.7589, -111.8883]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="map-container"
        eventHandlers={{
          click: () => onVehicleSelect(null) 
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Vehicles */}
        {vehicles.map((vehicle) => (
          <React.Fragment key={vehicle.id}>
            <Marker
              position={[vehicle.position.lat, vehicle.position.lng]}
              icon={createVehicleIcon(vehicle.type, vehicle.status)}
              eventHandlers={{
                click: () => onVehicleSelect(vehicle)
              }}
            />

            {/* Render route if vehicle is moving */}
            {vehicle.route && vehicle.route.length > 1 && (
              <Polyline
                positions={vehicle.route.map(point => [point.lat, point.lng])}
                color={getStatusColor(vehicle.status)}
                weight={3}
                opacity={0.7}
                dashArray="5, 10"
              />
            )}
          </React.Fragment>
        ))}

        {/* Render POIs */}
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.position.lat, poi.position.lng]}
            icon={createPOIIcon(poi.type)}
            eventHandlers={{
              click: () => onVehicleSelect(null) // Clear vehicle selection when POI is clicked
            }}
          >
            <Popup 
              maxWidth={320}
              minWidth={280}
              autoPan={true}
              autoPanPadding={[20, 20]}
              keepInView={true}
              closeButton={true}
            >
              <div className="poi-popup">
                <h3>{poi.name}</h3>
                <div className="popup-details">
                  <p><strong>Type:</strong> <span className="popup-value">{poi.type.replace('_', ' ')}</span></p>
                  <p><strong>Description:</strong> <span className="popup-value">{poi.description}</span></p>
                  {poi.materials && poi.materials.length > 0 && (
                    <p><strong>Materials:</strong> <span className="popup-value">{poi.materials.join(', ')}</span></p>
                  )}
                  {poi.capacity && (
                    <p><strong>Capacity:</strong> <span className="popup-value">{poi.currentAmount}/{poi.capacity} tons</span></p>
                  )}
                  {poi.status && (
                    <p><strong>Status:</strong> 
                      <span className="status-badge status-operational">
                        {poi.status}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView; 
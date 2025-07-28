import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Ensure jsdom is properly set up
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.location = dom.window.location;

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({
      setView: vi.fn(),
      addLayer: vi.fn(),
      removeLayer: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    marker: vi.fn(() => ({
      addTo: vi.fn(),
      bindPopup: vi.fn(),
      setLatLng: vi.fn(),
    })),
    popup: vi.fn(),
    icon: vi.fn(),
    divIcon: vi.fn(() => ({
      options: {},
    })),
    Icon: {
      Default: {
        prototype: {
          _getIconUrl: vi.fn(),
        },
        mergeOptions: vi.fn(),
      },
    },
  },
}));

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'map-container' }, children);
  },
  TileLayer: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'tile-layer' });
  },
  Marker: ({ children }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'marker' }, children);
  },
  Popup: ({ children }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'popup' }, children);
  },
  useMap: () => ({
    setView: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
  }),
}));

// Mock Socket.IO
vi.mock('socket.io-client', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

// Mock environment variables
vi.stubEnv('VITE_BACKEND_URL', 'http://localhost:3001');

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = vi.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn(() => {});
HTMLElement.prototype.scrollIntoView = vi.fn(() => {});

// Mock scrollIntoView for any object with current property
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(() => {}),
  writable: true,
  configurable: true,
});

// Mock scrollIntoView globally
global.scrollIntoView = vi.fn(() => {});
Element.prototype.scrollIntoView = vi.fn(() => {});
HTMLElement.prototype.scrollIntoView = vi.fn(() => {});

// Mock scrollIntoView for any object with current property
const mockScrollIntoView = vi.fn(() => {});
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
  configurable: true,
});

// Mock for any object that might have scrollIntoView
Object.defineProperty(window, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
  configurable: true,
});

// Mock any object with current property to have scrollIntoView
Object.defineProperty(Object.prototype, 'current', {
  get() {
    if (!this._mockCurrent) {
      this._mockCurrent = {
        scrollIntoView: mockScrollIntoView,
        scrollTo: vi.fn(),
        scrollTop: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(),
        closest: vi.fn(),
        focus: vi.fn(),
        blur: vi.fn(),
        click: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }
    return this._mockCurrent;
  },
  set(value) {
    this._mockCurrent = value;
  },
  configurable: true
});

// Mock the specific scrollIntoView function call
const originalScrollIntoView = Element.prototype.scrollIntoView;
Element.prototype.scrollIntoView = function(options) {
  if (this && typeof this.scrollIntoView === 'function') {
    return originalScrollIntoView.call(this, options);
  }
  return mockScrollIntoView(options);
};

// Mock the optional chaining operator for scrollIntoView
const originalGet = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__')?.get;
Object.defineProperty(Object.prototype, '__proto__', {
  get() {
    if (this && this.current && typeof this.current.scrollIntoView === 'function') {
      return this.current;
    }
    return originalGet?.call(this);
  },
  configurable: true
}); 
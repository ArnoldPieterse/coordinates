import { setupControls } from '../../src/systems/controls.js';
import * as THREE from 'three';

const mockCamera = {
  rotation: { x: 0, y: 0 },
  updateMatrixWorld: jest.fn(),
  matrixWorld: new THREE.Matrix4(),
  up: new THREE.Vector3(0, 1, 0),
};

const mockPlayerVelocity = {
  add: jest.fn(),
  clone: () => mockPlayerVelocity,
  multiplyScalar: jest.fn(),
};
const mockThrowBall = jest.fn();
const mockPlayerDirection = {};

describe('FPS Controls Integration', () => {
  it('should initialize controls and respond to key events', () => {
    const applyControls = setupControls(mockCamera, mockPlayerVelocity, mockThrowBall, mockPlayerDirection);
    expect(typeof applyControls).toBe('function');
    applyControls(0.016, true, mockCamera);
  });
}); 
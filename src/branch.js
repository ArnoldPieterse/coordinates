// IDX-BRANCH-01: Modular Branch Class
// See PROMPTS.md for biological realism prompt
import * as THREE from 'three';

export class Branch {
  /**
   * @param {THREE.Vector3} origin
   * @param {THREE.Euler} orientation
   * @param {number} length
   * @param {number} radius
   * @param {number} level
   * @param {number} sectionCount
   * @param {number} segmentCount
   */
  constructor(
    origin = new THREE.Vector3(),
    orientation = new THREE.Euler(),
    length = 0,
    radius = 0,
    level = 0,
    sectionCount = 0,
    segmentCount = 0,
  ) {
    this.origin = origin.clone();
    this.orientation = orientation.clone();
    this.length = length;
    this.radius = radius;
    this.level = level;
    this.sectionCount = sectionCount;
    this.segmentCount = segmentCount;
    this.children = [];
  }
} 
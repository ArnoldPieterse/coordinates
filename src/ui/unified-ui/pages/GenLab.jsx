import React from 'react';

export default function GenLab() {
  return (
    <div className="genlab-page">
      <h1>Procedural Generation Lab</h1>
      <div className="genlab-controls">
        <label>Tree Type:
          <select>
            <option>Pine</option>
            <option>Broadleaf</option>
            <option>Birch</option>
            <option>Willow</option>
            <option>Palm</option>
            <option>Cypress</option>
            <option>Maple</option>
          </select>
        </label>
        <label>Planet Type:
          <select>
            <option>Earth-like</option>
            <option>Mars</option>
            <option>Venus</option>
            <option>Gas Giant</option>
            <option>Ice World</option>
          </select>
        </label>
        <button>Generate</button>
        <button>Export</button>
        <button>Import</button>
      </div>
      <div className="genlab-preview">
        <div className="preview-placeholder">[3D Preview Here]</div>
      </div>
    </div>
  );
} 
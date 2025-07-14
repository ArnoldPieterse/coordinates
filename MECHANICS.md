# Mechanics: Artist Controls, LOD, Animation, Collaboration

## 1. Artist Controls
### 1.1 Node Graph Editing
- Drag-and-drop node creation and connection.
- Context menus for adding/removing nodes.
- Example:
```js
// Node creation menu
function showNodeMenu(pos) {
  // ...
}
```

### 1.2 Parameter Sliders
- Expose all key parameters (angle, length, children, etc.) as sliders or inputs.

## 2. LOD and Animation
### 2.1 LOD Controls
- Per-branch and global LOD sliders.
- Real-time mesh update on LOD change.

### 2.2 Animation Layering
- Allow stacking of multiple animation effects (wind, growth, season).
- UI for animation blending and preview.

## 3. Collaboration
### 3.1 Real-Time Editing
- Sync node graph and parameters between users.
- Show collaborator actions in UI.

### 3.2 Versioning
- Undo/redo, branching, and merging of edits.

---

For more, see GAMEPLAY.md for user-facing controls and SYSTEM_ARCHITECTURE.md for technical details. 
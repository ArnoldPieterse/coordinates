# Universal Indexing System for Documentation & Code

## Purpose
This indexing system provides a consistent, human-readable way to reference features, sections, and concepts across all project documentation and code comments. It enables easy cross-referencing, searching, and navigation for contributors and AI agents.

## Index Format
- **Prefix**: `IDX-`
- **Category**: Short code for the document or feature (e.g., `DOC`, `AI`, `PHYS`, `SYS`)
- **Section**: Numeric or alphanumeric section identifier (e.g., `01`, `A1`)
- **Optional Detail**: Further sub-section or detail (e.g., `a`, `b`, `i`)

**Full Index Example:**
```
IDX-DOC-01a   // Documentation, Section 1, Subsection a
IDX-AI-02     // AI System, Section 2
IDX-PHYS-03b  // Physics, Section 3, Subsection b
```

## Usage in Documentation
- Place the index at the start of each major section or feature.
- Reference other sections using their index (e.g., "See IDX-AI-02 for details on AI pattern recognition.")

## Usage in Code Comments
- Add the index in comments above relevant code blocks:
```js
// IDX-AI-02: Neural network pattern recognition logic
function recognizePattern(input) { ... }
```
- Use the index in TODOs and FIXMEs for traceability:
```js
// TODO IDX-PHYS-03b: Optimize collision detection
```

## Referencing the Index System
- In every document and code comment template, add:
  > For index reference format, see [INDEX_DESCRIBER.md](./INDEX_DESCRIBER.md)

## Example Table
| Index         | Description                        |
|-------------- |------------------------------------|
| IDX-DOC-01    | Introduction section in docs       |
| IDX-AI-02     | AI system pattern recognition      |
| IDX-PHYS-03b  | Physics engine, collision section  |
| IDX-SYS-04    | System architecture overview       |

---
**For full details and updates, always refer to this file.** 
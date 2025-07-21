# CONVENTIONS.md

## Naming Conventions

- **Folders:** `kebab-case` (e.g., `user-profile`, `dashboard-widgets`)
- **Files:** `kebab-case.js` for scripts, `PascalCase.jsx` for React components (e.g., `main-header.jsx`)
- **Variables/Functions:** `camelCase` (e.g., `userName`, `fetchData`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_WIDGETS`)
- **Branches:** `feature/`, `bugfix/`, `hotfix/`, `release/` prefixes (e.g., `feature/widget-system`)
- **Commits:** Use imperative mood, concise and descriptive (e.g., `Add widget system scaffolding`)

---

## Accessibility Requirements
- All interactive elements must be keyboard accessible.
- Use ARIA roles and attributes for custom widgets and live regions.
- Ensure visible focus indicators for all focusable elements.
- Maintain sufficient color contrast (WCAG AA+ minimum).
- Provide text alternatives for all non-text content.
- Test with screen readers and keyboard-only navigation.
- Reference the accessibility checklist in `src/personas/accessibility-specialist/checklist.md` for detailed requirements.

---

## File & Folder Structure

- Group related files by feature or domain.
- Keep folder depth to 2-3 levels max.
- Place shared components in `src/components/`.
- Place persona files in `src/personas/<persona-name>/`.
- Place documentation in `docs/` and index with `docs/INDEX.md`.

**Example:**
```
/src
  /components
    /widgets
      WidgetContainer.jsx
      WidgetSettings.jsx
  /personas
    /qa-engineer
      prompts.md
      memory.md
  /api
  /styles
  /utils
/public
/docs
```

---

## Documentation Standards

- All major folders should have a `README.md` describing their purpose.
- All scripts must be documented in `SCRIPTS.md`.
- All new features must be described in the main `README.md` and, if complex, in a dedicated markdown file in `docs/`.
- Use consistent markdown formatting and section headers.

---

## Code Style
- Use Prettier or ESLint for code formatting.
- Always include type annotations for TypeScript files.
- Document all exported functions and components with JSDoc or similar. 
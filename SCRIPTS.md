# SCRIPTS.md

## Project Scripts Overview
This document lists all major scripts used in the project, their purpose, and usage instructions. For any missing scripts, manual steps are described and marked for future automation.

---

### NPM Scripts

| Script Name                  | Purpose                                      | Usage                        |
|-----------------------------|----------------------------------------------|------------------------------|
| `npm run build`             | Build the project for production             | `npm run build`              |
| `npm run test`              | Run unit and integration tests               | `npm run test`               |
| `npm run preview`           | Preview the production build locally         | `npm run preview`            |
| `npm run lint`              | Lint the codebase                           | `npm run lint`               |
| `npm run test:widgets`      | Test dashboard widgets (add if missing)      | `npm run test:widgets`       |
| `npm run test:notifications`| Test notification system (add if missing)    | `npm run test:notifications` |
| `npm run generate:widget-scaffold` | Scaffold widget system (add if missing) | `npm run generate:widget-scaffold` |
| `npm run generate:notification-backend` | Scaffold notification backend (add if missing) | `npm run generate:notification-backend` |

---

### Node Scripts

| Script Name                  | Purpose                                      | Usage                        |
|-----------------------------|----------------------------------------------|------------------------------|
| `node src/personas/run-persona.js` | Run a specific persona's action script | `node src/personas/run-persona.js <persona-folder>` |
| `node src/personas/run-persona-network.js` | Run all personas in sequence | `node src/personas/run-persona-network.js` |

---

### Shell/PowerShell Scripts

| Script Name                  | Purpose                                      | Usage                        |
|-----------------------------|----------------------------------------------|------------------------------|
| `sprint_terminal_actions.ps1`| Run all persona terminal actions for sprint  | `powershell -ExecutionPolicy Bypass -File sprint_terminal_actions.ps1` |

---

### Manual Steps (To Automate)
- **Widget Scaffold:** If `generate:widget-scaffold` is missing, manually create widget files in `src/components/widgets/` and update routes.
- **Notification Backend:** If `generate:notification-backend` is missing, manually create notification service files in `src/api/notifications/` and update API endpoints.
- **Deployment:** If not automated, deploy manually via AWS CLI or console.

---

## Adding New Scripts
- Add new scripts to `package.json` under the `scripts` section.
- Document each new script here with its purpose and usage. 
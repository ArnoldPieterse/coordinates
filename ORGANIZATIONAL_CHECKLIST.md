# ORGANIZATIONAL_CHECKLIST.md

## Prioritized Checklist for Organizational Improvements

### 1. Branch & Git Hygiene
- [ ] List all local and remote branches (`git branch`, `git branch -r`)
- [ ] Remove obsolete or merged branches using `scripts/branch_cleanup.ps1`
- [ ] Standardize branch naming: `feature/`, `bugfix/`, `hotfix/`, `release/`
- [ ] Document branch workflow in `CONVENTIONS.md`

### 2. Script & Automation Consistency
- [ ] List all npm scripts (`npm run`)
- [ ] Implement missing scripts (e.g., `generate:widget-scaffold`, `generate:notification-backend`)
- [ ] Document all scripts in `SCRIPTS.md`
- [ ] Add checks in scripts for prerequisites and clear logging

### 3. File & Folder Structure
- [ ] Review and refactor folder structure for logical grouping and minimal depth
- [ ] Rename files/folders to follow naming conventions
- [ ] Ensure all major folders have a `README.md`

### 4. Naming Conventions
- [ ] Standardize file, folder, variable, and branch naming as per `CONVENTIONS.md`
- [ ] Update existing files and scripts to match conventions

### 5. Documentation Consistency
- [ ] Centralize documentation in `docs/` and index with `docs/INDEX.md`
- [ ] Ensure all scripts and features are documented in `SCRIPTS.md` and `README.md`
- [ ] Use consistent markdown formatting and section headers

### 6. Automation & Reproducibility
- [ ] For every manual step, create a script or document the process
- [ ] Add echo/logging to all scripts for clarity
- [ ] Regularly review and update this checklist as the project evolves 
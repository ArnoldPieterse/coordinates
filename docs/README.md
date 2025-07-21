# Pages Directory

This folder contains all main page components for the Rekursing platform UI. Each file represents a top-level route or major view in the application.

## Pages
- **HomePage.jsx**: The main landing page for users, featuring onboarding and dashboard entry points.
- **AIAgentDashboard.jsx**: Dashboard for managing and viewing AI agents.
- **ContextDashboard.jsx**: Contextual data and analytics dashboard.
- **Docs.jsx**: Documentation and help resources.
- **GenLab.jsx**: Experimental features and AI generation lab.
- **Play.jsx**: Game launch and play interface.
- **Settings.jsx**: User and system settings.
- **SocialAI.jsx**: Social and community AI features.
- **Tools.jsx**: Utility tools and plugins.
- **TradingDashboard.jsx**: Trading and analytics dashboard.

## Patterns
- Modular page components are inspired by patterns from [FlightCentreTestKotlin](https://github.com/ArnoldPieterse/FlightCentreTestKotlin) and best practices for scalable React apps.
- Each page imports shared components from `src/ui/components/` and uses global styles from `src/ui/styles/`.

## Conventions
- All page files use `PascalCase.jsx` naming.
- Each page should have a clear, single responsibility and be documented here. 
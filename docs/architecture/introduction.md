# Introduction

This document outlines the overall project architecture for Scrum71, a Scrum/Kanban project management platform. Its primary goal is to serve as the guiding architectural blueprint for development, ensuring consistency and adherence to chosen patterns and technologies.

**Relationship to Frontend Architecture:**
Scrum71 is a client-side single-page application (SPA) with Firebase as the backend. The frontend architecture is integral to this document as there is no separate backend service layer—the browser-based application connects directly to Firebase services.

## Starter Template or Existing Project

**Status:** Existing brownfield project

The architecture is based on an existing vanilla JavaScript application with:
- ES6 modules without build tooling
- Firebase SDK loaded via CDN
- Single HTML entry point with modular JS files
- CSS with custom properties for theming

No starter template is used. The architecture preserves this lightweight approach while extending functionality.

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-09 | 1.0.0 | Initial architecture document | Architecture Team |
| 2026-01-09 | 1.1.0 | Added error handling, testing strategy, input validation, accessibility guidelines | Architecture Team |

---

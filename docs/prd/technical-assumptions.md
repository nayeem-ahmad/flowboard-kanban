# Technical Assumptions

## Repository Structure
Monorepo - single repository containing all frontend code

## Service Architecture
- **Frontend**: Vanilla JavaScript with ES6 modules (no build step required)
- **Backend**: Firebase (Firestore for database, Auth for authentication)
- **Hosting**: Firebase Hosting or GitHub Pages (static site)
- **Architecture Pattern**: Client-side SPA with direct Firestore access

## Testing Requirements
- Manual testing with convenience methods for local development
- Unit tests for utility functions (future enhancement)
- E2E tests for critical user flows (future enhancement)

## Additional Technical Assumptions
- Firebase SDK loaded via CDN (compat version for simplicity)
- Chart.js for burndown chart visualization
- No build process - direct browser ES6 module support
- CSS custom properties for theming
- LocalStorage as offline fallback and cache
- Real-time Firestore listeners for live updates
- File attachments stored in Firebase Storage (future)

---

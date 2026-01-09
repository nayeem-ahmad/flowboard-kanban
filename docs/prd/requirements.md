# Requirements

## Functional Requirements

**Authentication & User Management**
- FR1: Users can register and sign in using email/password authentication
- FR2: Users can sign in using Google OAuth
- FR3: Users can sign in using GitHub OAuth
- FR4: Users can reset their password via email
- FR5: Users can update their profile (display name, photo URL, mobile, bio)
- FR6: User sessions persist across browser sessions

**Project Management**
- FR7: Users can create, edit, and delete projects
- FR8: Each project has a name, description, owner, and team members
- FR9: Projects contain a backlog of items (cards) not yet assigned to sprints
- FR10: Project owners can define custom label colors and their meanings in project settings
- FR11: Backlog items can be added to one or more sprints while remaining in the backlog
- FR12: Users can switch between projects using a project selector in the header

**Sprint/Board Management**
- FR13: Users can create, edit, and delete sprints (boards) within a project
- FR14: Each sprint has a name, start date, end date, and goal description
- FR15: Sprints are represented as Kanban boards with customizable columns (lists)
- FR16: Users can add, rename, reorder, copy, clear, and delete lists
- FR17: Users can switch between sprints/boards using a board selector
- FR18: Board background colors are customizable with gradient presets

**Card Management**
- FR19: Users can create, edit, duplicate, and delete cards within lists
- FR20: Cards have title, description, labels, due date, checklist, and assignee
- FR21: Cards can be assigned to team members from the project team
- FR22: Cards support time tracking with initial estimate (hours) and remaining hours
- FR23: Cards can be labeled with colors defined at the project level
- FR24: Cards support checklists with completable items
- FR25: Cards can have file attachments (images, documents)
- FR26: Cards support threaded comments from team members
- FR27: Cards can be shared via unique URL (deep linking)
- FR28: Cards can be dragged and dropped between lists and reordered within lists

**Team Collaboration**
- FR29: Project owners can invite team members using shareable invite links
- FR30: Invite links contain unique tokens and can be regenerated
- FR31: Team members can be viewed and managed in project info modal
- FR32: Team member roles include owner, admin, and member

**Search & Navigation**
- FR33: Users can search cards across all boards by title and description
- FR34: Search results show card location (board and list) with quick navigation
- FR35: Keyboard shortcut (Cmd/Ctrl+K) opens search modal

**Burndown Chart**
- FR36: A floating burndown panel displays sprint progress
- FR37: Burndown chart plots remaining hours against sprint timeline (start to end date)
- FR38: Chart shows ideal burndown trend line for comparison
- FR39: Chart updates in real-time as card remaining hours change
- FR40: Burndown panel can be collapsed/expanded

**Data & Sync**
- FR41: All data syncs to Firebase Firestore in real-time
- FR42: Offline fallback stores data in localStorage
- FR43: Data syncs across multiple devices for the same user

## Non-Functional Requirements

- NFR1: Application loads initial view within 2 seconds on 3G connection
- NFR2: Drag and drop interactions respond within 100ms
- NFR3: Application works offline with localStorage fallback
- NFR4: UI is responsive and works on mobile, tablet, and desktop viewports
- NFR5: Dark mode and light mode themes are supported with system preference detection
- NFR6: Application uses Firebase free tier where feasible
- NFR7: All user inputs are validated and sanitized
- NFR8: Card URLs are shareable and work for team members with access
- NFR9: Application follows WCAG 2.1 AA accessibility guidelines
- NFR10: Code is maintainable with modular JavaScript architecture

---

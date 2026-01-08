# Scrum71 Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Provide a simple, intuitive platform for managing projects using Scrum/Kanban methodologies
- Enable teams to visualize work progress through Trello-like boards
- Support complete sprint management with backlog, planning, and burndown tracking
- Facilitate team collaboration through invites, comments, and card sharing
- Deliver time tracking capabilities for sprint burndown and capacity planning

### Background Context
Scrum71 addresses the need for a lightweight yet feature-complete project management tool that combines the visual simplicity of Kanban boards with Scrum practices like sprints, backlogs, and burndown charts. Many existing tools are either too complex for small teams or lack essential Scrum features. Scrum71 bridges this gap by offering an approachable interface with powerful sprint tracking capabilities, time-based burndown visualization, and seamless team collaboration features.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-09 | 1.0.0 | Initial PRD creation | Product Team |

---

## Requirements

### Functional Requirements

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

### Non-Functional Requirements

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

## User Interface Design Goals

### Overall UX Vision
A clean, modern interface inspired by Trello's simplicity with enhanced Scrum capabilities. The design emphasizes visual hierarchy, smooth animations, and intuitive drag-and-drop interactions. Glass-morphism effects and gradient backgrounds provide a contemporary feel while maintaining readability.

### Key Interaction Paradigms
- **Drag and Drop**: Primary method for moving cards between lists and reordering
- **Modal Dialogs**: Used for card details, project info, and settings
- **Dropdown Selectors**: For project and board switching in the header
- **Inline Editing**: List titles and card quick-edit are editable in place
- **Floating Panels**: Burndown chart as a collapsible floating element

### Core Screens and Views
1. **Auth Screen**: Login/Register/Password Reset forms with social auth options
2. **Main Board View**: Kanban board with lists, cards, and add buttons
3. **Card Modal**: Full card editing with description, checklist, labels, time tracking, comments, attachments
4. **Project Info Modal**: Project details, team members, invite link management
5. **Project Management Screen**: Sidebar list of projects with backlog, sprints, and team tabs
6. **Search Modal**: Quick search overlay with keyboard navigation
7. **Board Creation Modal**: New board form with name and background color picker

### Accessibility
WCAG 2.1 AA compliance with:
- Keyboard navigation for all interactive elements
- Focus indicators and skip links
- Sufficient color contrast ratios
- Screen reader compatible markup

### Branding
- **Primary Font**: Inter (Google Fonts)
- **Color Palette**: Purple/indigo gradients as accent, neutral grays for surfaces
- **Logo**: Abstract Kanban board icon with "Scrum71" wordmark
- **Theme Support**: Light and dark modes with smooth transitions

### Target Platforms
Web Responsive - optimized for desktop (primary), tablet, and mobile viewports

---

## Technical Assumptions

### Repository Structure
Monorepo - single repository containing all frontend code

### Service Architecture
- **Frontend**: Vanilla JavaScript with ES6 modules (no build step required)
- **Backend**: Firebase (Firestore for database, Auth for authentication)
- **Hosting**: Firebase Hosting or GitHub Pages (static site)
- **Architecture Pattern**: Client-side SPA with direct Firestore access

### Testing Requirements
- Manual testing with convenience methods for local development
- Unit tests for utility functions (future enhancement)
- E2E tests for critical user flows (future enhancement)

### Additional Technical Assumptions
- Firebase SDK loaded via CDN (compat version for simplicity)
- Chart.js for burndown chart visualization
- No build process - direct browser ES6 module support
- CSS custom properties for theming
- LocalStorage as offline fallback and cache
- Real-time Firestore listeners for live updates
- File attachments stored in Firebase Storage (future)

---

## Epic List

### Epic 1: Foundation & Core Board Experience
**Goal**: Establish complete Kanban board functionality with lists, cards, drag-and-drop, and basic card properties.

### Epic 2: Project & Sprint Management
**Goal**: Enable project organization with backlogs, sprint creation, and project-board relationships.

### Epic 3: Team Collaboration & Sharing
**Goal**: Implement team invites, member management, card comments, and URL-based card sharing.

### Epic 4: Time Tracking & Burndown
**Goal**: Add time estimation/tracking to cards and implement floating burndown chart with trend line.

### Epic 5: Enhanced Card Features
**Goal**: Add file attachments, custom project labels, and enhanced card interactions.

---

## Epic 1: Foundation & Core Board Experience

**Goal**: Deliver a fully functional Kanban board where users can authenticate, create boards with lists, manage cards with basic properties (title, description, labels, due date, checklist), and drag-and-drop cards between lists. This epic establishes the core user experience.

### Story 1.1: User Authentication Setup
**As a** user,  
**I want** to register and sign in with email/password or social providers,  
**so that** I can access my personal boards securely.

**Acceptance Criteria:**
1. Registration form accepts email, password, and display name
2. Login form accepts email and password
3. Google OAuth sign-in button initiates popup flow
4. GitHub OAuth sign-in button initiates popup flow
5. Password reset sends email with reset link
6. Auth state persists across browser sessions
7. Loading screen displays during auth check
8. Error messages display for invalid credentials

### Story 1.2: Basic Board Display and Theme
**As a** user,  
**I want** to see a visually appealing board interface with theme support,  
**so that** I can work comfortably in my preferred color scheme.

**Acceptance Criteria:**
1. Header displays logo, board selector, and user avatar
2. Board area fills viewport below header with gradient background
3. Theme toggle switches between light and dark modes
4. Theme preference persists in localStorage
5. System theme preference is detected on first visit
6. Empty state displays when no board is selected

### Story 1.3: List Management
**As a** user,  
**I want** to create, rename, reorder, and delete lists on my board,  
**so that** I can organize my workflow stages.

**Acceptance Criteria:**
1. "Add another list" button appears after existing lists
2. New list form accepts title and creates list on submit
3. List title is editable inline by clicking
4. List menu provides Move Left, Move Right, Copy, Clear, Delete actions
5. Lists can be dragged to reorder
6. List card count badge updates dynamically
7. Changes persist to Firestore immediately

### Story 1.4: Card Creation and Basic Editing
**As a** user,  
**I want** to create cards and edit their basic properties,  
**so that** I can track individual work items.

**Acceptance Criteria:**
1. "Add a card" button appears at bottom of each list
2. Quick-add form accepts title and creates card
3. Clicking card opens modal with full editing
4. Card modal displays title, description fields
5. Card modal has save and cancel buttons
6. Card can be duplicated via modal action
7. Card can be deleted via modal action
8. Changes persist immediately

### Story 1.5: Card Labels and Due Dates
**As a** user,  
**I want** to add labels and due dates to cards,  
**so that** I can categorize and schedule work.

**Acceptance Criteria:**
1. Card modal shows label picker with color options
2. Multiple labels can be selected per card
3. Selected labels display as colored bars on card
4. Due date picker allows date selection
5. Due date displays on card with icon
6. Overdue dates are highlighted in red
7. Upcoming dates (within 2 days) show warning color

### Story 1.6: Card Checklists
**As a** user,  
**I want** to add checklists to cards,  
**so that** I can break down work into subtasks.

**Acceptance Criteria:**
1. Card modal shows checklist section
2. New checklist items can be added via input
3. Checklist items have checkbox to toggle completion
4. Completed items show strikethrough styling
5. Checklist items can be deleted
6. Card displays checklist progress (e.g., "2/5") when items exist
7. Progress updates in real-time

### Story 1.7: Drag and Drop Cards
**As a** user,  
**I want** to drag cards between lists and reorder within lists,  
**so that** I can update work status visually.

**Acceptance Criteria:**
1. Cards are draggable with visual feedback (rotation, shadow)
2. Drop zones highlight when card hovers over list
3. Cards can be dropped between other cards with insertion indicator
4. Card order persists after drop
5. Moving card to different list updates status
6. Animation provides smooth transition feedback
7. Touch devices support drag gestures

### Story 1.8: Board Creation and Selection
**As a** user,  
**I want** to create new boards and switch between them,  
**so that** I can manage multiple projects.

**Acceptance Criteria:**
1. Board selector dropdown lists all user boards
2. Clicking board name switches active board
3. "Create new board" button opens creation modal
4. Board creation form accepts name and background color
5. Color picker offers gradient presets
6. New board appears in selector and becomes active
7. Board selector shows current board name

---

## Epic 2: Project & Sprint Management

**Goal**: Introduce project hierarchy where boards represent sprints, projects contain backlogs, and users can manage sprint dates/goals. Enable backlog-to-sprint item flow.

### Story 2.1: Project Entity and Selector
**As a** user,  
**I want** to organize boards under projects,  
**so that** I can group related sprints together.

**Acceptance Criteria:**
1. Project selector appears in header alongside board selector
2. Projects have name, description, and owner
3. Creating a board prompts project selection
4. Switching projects filters available boards
5. "Manage Projects" button opens project management screen
6. New project can be created from selector dropdown

### Story 2.2: Project Management Screen
**As a** user,  
**I want** a dedicated screen to manage project details,  
**so that** I can configure backlogs, sprints, and team.

**Acceptance Criteria:**
1. Project management screen shows sidebar list of projects
2. Selecting project displays detail panel with tabs
3. Tabs include: Backlog, Sprints, Team
4. Project name/description are editable
5. Screen can be exited to return to board view
6. Empty state prompts project creation

### Story 2.3: Project Backlog Management
**As a** product owner,  
**I want** to maintain a backlog of items for my project,  
**so that** I can plan future sprints.

**Acceptance Criteria:**
1. Backlog tab shows list of backlog items
2. New backlog items can be added with title
3. Backlog items can be edited and deleted
4. Backlog items show creation date
5. Items persist in project data
6. Backlog is separate from sprint boards

### Story 2.4: Sprint Properties (Dates and Goal)
**As a** scrum master,  
**I want** to set sprint start/end dates and goal,  
**so that** I can define sprint boundaries.

**Acceptance Criteria:**
1. Board/sprint has start date and end date fields
2. Board/sprint has goal text field
3. Sprint dates display in board info
4. Sprint goal displays in board header or info modal
5. Dates are used for burndown chart timeline
6. Sprint duration calculates automatically

### Story 2.5: Add Backlog Items to Sprint
**As a** product owner,  
**I want** to add backlog items to sprints,  
**so that** I can plan sprint scope.

**Acceptance Criteria:**
1. Backlog items can be selected for sprint inclusion
2. Adding to sprint creates corresponding card on board
3. Original backlog item remains in backlog (reference)
4. Backlog shows which items are in active sprints
5. Items can be removed from sprint without deleting from backlog
6. Sprint selector shows available sprints for project

---

## Epic 3: Team Collaboration & Sharing

**Goal**: Enable team collaboration with invite links, member management, card assignees, comments on cards, and shareable card URLs.

### Story 3.1: Team Member Invites
**As a** project owner,  
**I want** to invite team members using a shareable link,  
**so that** others can collaborate on my project.

**Acceptance Criteria:**
1. Project info modal shows invite link section
2. Invite link contains unique token and board/project ID
3. Link can be copied to clipboard with one click
4. Link can be regenerated (invalidating old links)
5. Regeneration requires confirmation
6. Invite description explains the link's purpose

### Story 3.2: Joining via Invite Link
**As a** team member,  
**I want** to join a project by clicking an invite link,  
**so that** I can collaborate with the team.

**Acceptance Criteria:**
1. Visiting invite URL while logged in processes join
2. User is added to project/board member list
3. User sees success toast notification
4. Invalid/expired tokens show error message
5. Already-member users see appropriate message
6. After joining, user is redirected to board

### Story 3.3: Team Member List and Roles
**As a** project owner,  
**I want** to view and manage team members,  
**so that** I can control project access.

**Acceptance Criteria:**
1. Project info modal shows team members list
2. Each member shows avatar, name, email, and role
3. Owner is clearly indicated
4. Member roles include: owner, admin, member
5. Members can be removed by owner/admin
6. Team count badge shows total members

### Story 3.4: Card Assignee Selection
**As a** user,  
**I want** to assign cards to team members,  
**so that** ownership is clear.

**Acceptance Criteria:**
1. Card modal shows assignee dropdown
2. Dropdown lists all project team members
3. Selecting member assigns them to card
4. Assignee displays on card with avatar
5. Assignee can be cleared (unassigned)
6. Only one assignee per card

### Story 3.5: Card Comments
**As a** team member,  
**I want** to add comments to cards,  
**so that** I can discuss work with teammates.

**Acceptance Criteria:**
1. Card modal shows comments section
2. Text input allows adding new comment
3. Comments show author, timestamp, and content
4. Comments are ordered newest-first or oldest-first (toggle)
5. Comment author can delete their own comments
6. Comments persist with card data

### Story 3.6: Shareable Card URLs
**As a** user,  
**I want** to share a direct link to a card,  
**so that** teammates can jump directly to it.

**Acceptance Criteria:**
1. Card modal shows "Share" or "Copy Link" action
2. URL format includes board ID and card ID
3. Visiting URL opens board with card modal active
4. URL works for all team members with access
5. Non-members see access denied message
6. Invalid card URLs show not-found message

---

## Epic 4: Time Tracking & Burndown

**Goal**: Implement time estimation and tracking on cards, aggregate remaining hours per list/board, and display an interactive burndown chart with ideal trend line.

### Story 4.1: Card Time Tracking Fields
**As a** developer,  
**I want** to log initial estimate and remaining hours on cards,  
**so that** my team can track effort.

**Acceptance Criteria:**
1. Card modal shows "Initial Estimate (hrs)" number input
2. Card modal shows "Remaining (hrs)" number input
3. Values accept decimal (0.5 increments)
4. Time badge appears on card if hours > 0
5. Remaining hours can be updated independently
6. Zero remaining indicates complete

### Story 4.2: List Hour Totals
**As a** scrum master,  
**I want** to see total hours per list,  
**so that** I can gauge column workload.

**Acceptance Criteria:**
1. List header shows total initial estimate badge
2. List header shows total remaining hours badge
3. Badges update when cards are added/moved/edited
4. Different styling distinguishes estimate vs remaining
5. Tooltips explain badge meanings

### Story 4.3: Burndown Chart Panel
**As a** scrum master,  
**I want** to see a burndown chart for the sprint,  
**so that** I can track progress against timeline.

**Acceptance Criteria:**
1. Floating burndown panel appears on board view
2. Panel header shows total remaining hours
3. Chart plots remaining hours on Y-axis
4. Chart plots sprint days on X-axis (start to end date)
5. Panel can be collapsed to header-only view
6. Panel can be dragged/repositioned (optional)

### Story 4.4: Burndown Trend Line
**As a** scrum master,  
**I want** to see an ideal trend line on the burndown,  
**so that** I can compare actual vs expected progress.

**Acceptance Criteria:**
1. Chart shows ideal burndown line (start total to zero)
2. Ideal line is dashed/styled differently from actual
3. Chart shows actual progress line from historical data
4. Legend indicates ideal vs actual lines
5. Intersection/divergence is visually clear

### Story 4.5: Burndown History Tracking
**As a** system,  
**I want** to record daily remaining hours,  
**so that** burndown chart shows historical progress.

**Acceptance Criteria:**
1. System records total remaining hours daily
2. History stores date and remaining value pairs
3. History used to plot actual burndown line
4. New day's data added automatically or on first access
5. History persists with board data

---

## Epic 5: Enhanced Card Features

**Goal**: Add file attachments to cards, implement project-level custom labels with meanings, and polish card interactions.

### Story 5.1: File Attachments on Cards
**As a** user,  
**I want** to attach files to cards,  
**so that** I can reference relevant documents.

**Acceptance Criteria:**
1. Card modal shows attachments section
2. File upload button allows selecting files
3. Files upload to Firebase Storage
4. Attachments display as list with filename and icon
5. Clicking attachment opens/downloads file
6. Attachments can be deleted
7. Image attachments show thumbnail preview

### Story 5.2: Project Label Configuration
**As a** project owner,  
**I want** to define label colors and meanings,  
**so that** team uses consistent categorization.

**Acceptance Criteria:**
1. Project settings include label configuration
2. Each label has color and meaning/name text
3. Default labels provided (e.g., Priority, Bug, Feature)
4. Labels can be added, edited, deleted
5. Card label picker shows configured labels
6. Label meaning displays on hover

### Story 5.3: Enhanced Card Display
**As a** user,  
**I want** cards to show key info at a glance,  
**so that** I can scan the board efficiently.

**Acceptance Criteria:**
1. Cards show labels as colored bars at top
2. Cards show due date with appropriate styling
3. Cards show checklist progress if items exist
4. Cards show time badge if hours tracked
5. Cards show assignee avatar
6. Cards show comment count if comments exist
7. Cards show attachment icon if files attached

---

## Checklist Results Report

*To be completed after PRD review and validation against pm-checklist.*

---

## Next Steps

### UX Expert Prompt
"Review the Scrum71 PRD at docs/prd.md and create a comprehensive front-end specification. Focus on the core screens (Auth, Board View, Card Modal, Project Management), component hierarchy, interaction patterns, and responsive behavior. Consider the existing vanilla JS architecture."

### Architect Prompt
"Review the Scrum71 PRD at docs/prd.md and create the technical architecture document. Focus on the existing vanilla JS + Firebase stack, data models for projects/boards/cards, Firestore security rules, and real-time sync patterns. Address how attachments will use Firebase Storage."

# Epic 1: Foundation & Core Board Experience

**Goal**: Deliver a fully functional Kanban board where users can authenticate, create boards with lists, manage cards with basic properties (title, description, labels, due date, checklist), and drag-and-drop cards between lists. This epic establishes the core user experience.

## Story 1.1: User Authentication Setup
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

## Story 1.2: Basic Board Display and Theme
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

## Story 1.3: List Management
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

## Story 1.4: Card Creation and Basic Editing
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

## Story 1.5: Card Labels and Due Dates
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

## Story 1.6: Card Checklists
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

## Story 1.7: Drag and Drop Cards
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

## Story 1.8: Board Creation and Selection
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

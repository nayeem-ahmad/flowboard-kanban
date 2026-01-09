# Epic 2: Project & Sprint Management

**Goal**: Introduce project hierarchy where boards represent sprints, projects contain backlogs, and users can manage sprint dates/goals. Enable backlog-to-sprint item flow.

## Story 2.1: Project Entity and Selector
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

## Story 2.2: Project Management Screen
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

## Story 2.3: Project Backlog Management
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

## Story 2.4: Sprint Properties (Dates and Goal)
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

## Story 2.5: Add Backlog Items to Sprint
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

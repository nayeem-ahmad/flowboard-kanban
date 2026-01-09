# Story 2.1: Project Entity and Selector

## Status
Completed

## Story
**As a** user,  
**I want** to organize boards under projects,  
**so that** I can group related sprints together.

## Acceptance Criteria
1. Project selector appears in header alongside board selector
2. Projects have name, description, and owner
3. Creating a board prompts project selection
4. Switching projects filters available boards
5. "Manage Projects" button opens project management screen
6. New project can be created from selector dropdown

## Tasks / Subtasks
- [ ] Task 1: Project Data Model & Service
  - [ ] Define Project interface/schema (id, name, description, ownerId, memberIds)
  - [ ] Update Firestore security rules for Projects
  - [ ] Implement `createProject`, `getProjects`, `updateProject` in `project.js`

- [ ] Task 2: Project Selector UI
  - [ ] Add Project Selector dropdown to Header
  - [ ] Populate dropdown with user's projects
  - [ ] Persist selected project ID in `state` and `localStorage`

- [ ] Task 3: Board-Project Association
  - [ ] Update Board creation modal to include Project selection (or auto-select current)
  - [ ] Update `getBoards` to query by `projectId`
  - [ ] Filter displayed boards based on selected project

- [ ] Task 4: Navigation Integration
  - [ ] Add "Manage Projects" link/button to Project Selector
  - [ ] Ensure switching projects clears/updates current board view
  - [ ] Handle "No Project" empty state

## Dev Notes
- Existing `project.js` likely needs refactoring to separate "Project" entity from "Board" entity if they were conflated.
- Ensure backward compatibility for orphan boards if any.

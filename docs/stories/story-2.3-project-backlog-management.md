# Story 2.3: Project Backlog Management

## Status
Draft

## Story
**As a** product owner,  
**I want** to maintain a backlog of items for my project,  
**so that** I can plan future sprints.

## Acceptance Criteria
1. Backlog tab shows list of backlog items
2. New backlog items can be added with title
3. Backlog items can be edited and deleted
4. Backlog items show creation date
5. Items persist in project data
6. Backlog is separate from sprint boards

## Tasks / Subtasks
- [ ] Task 1: Backlog Data Structure
  - [ ] Define `BacklogItem` schema (id, title, description, createdAt, status)
  - [ ] Add `backlog` array/collection to Project entity in Firestore

- [ ] Task 2: Backlog UI List
  - [ ] Implement Backlog Tab content in Project Management Screen
  - [ ] Render list of items with title and date
  - [ ] Sort by creation date (newest first)

- [ ] Task 3: Add/Edit/Delete Operations
  - [ ] Add "Add Item" input field (quick add)
  - [ ] Implement inline editing or modal for item details
  - [ ] Implement delete action with confirmation

- [ ] Task 4: Persistence
  - [ ] Wire up Firestore updates for Backlog operations
  - [ ] Real-time listener for Project backlog changes

## Dev Notes
- Consider using a sub-collection for backlog items if the list is expected to grow large, otherwise an array on the Project document is simpler for now.

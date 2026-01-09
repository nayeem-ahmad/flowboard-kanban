# Story 2.5: Add Backlog Items to Sprint

## Status
Completed

## Story
**As a** product owner,  
**I want** to add backlog items to sprints,  
**so that** I can plan sprint scope.

## Acceptance Criteria
1. Backlog items can be selected for sprint inclusion
2. Adding to sprint creates corresponding card on board
3. Original backlog item remains in backlog (reference)
4. Backlog shows which items are in active sprints
5. Items can be removed from sprint without deleting from backlog
6. Sprint selector shows available sprints for project

## Tasks / Subtasks
- [ ] Task 1: Move to Sprint UI
  - [ ] Add "Move to Sprint" button/icon on Backlog Items
  - [ ] Implement Sprint (Board) Selector dropdown/modal
  - [ ] Filter boards to show only those belonging to current Project

- [ ] Task 2: Conversion Logic
  - [ ] Create function `convertBacklogItemToCard(item, boardId)`
  - [ ] Create new Card in target Board's first list
  - [ ] Copy title/description from Backlog Item

- [ ] Task 3: Backlog Status Update
  - [ ] Update Backlog Item status to `assigned` or `in-sprint`
  - [ ] Link Backlog Item to Board ID / Card ID

- [ ] Task 4: Feedback & Sync
  - [ ] Visual indicator in Backlog list for items assigned to sprints
  - [ ] Toast notification on success

## Dev Notes
- Decide if Backlog Item is *moved* (removed from backlog) or *linked* (stays in backlog but marked). Story says "Original backlog item remains... (reference)".

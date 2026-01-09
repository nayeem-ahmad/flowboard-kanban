# Story 3.4: Card Assignee Selection

## Status
Draft

## Story
**As a** user,  
**I want** to assign cards to team members,  
**so that** ownership is clear.

## Acceptance Criteria
1. Card modal shows assignee dropdown
2. Dropdown lists all project team members
3. Selecting member assigns them to card
4. Assignee displays on card with avatar
5. Assignee can be cleared (unassigned)
6. Only one assignee per card

## Tasks / Subtasks
- [ ] Task 1: Card Data Model
  - [ ] Add `assigneeId` field to Card schema

- [ ] Task 2: Card Modal UI - Assignee
  - [ ] Add Assignee selector (dropdown or user list) to Card Modal
  - [ ] Populate with Project Members
  - [ ] Show current assignee with Avatar

- [ ] Task 3: Card Board View UI
  - [ ] Render Assignee Avatar (small) on Card tile in Board view

- [ ] Task 4: Persistence
  - [ ] Save `assigneeId` updates to Firestore

## Dev Notes
- If assignee leaves project, handle graceful degradation (show "Unknown" or clear).

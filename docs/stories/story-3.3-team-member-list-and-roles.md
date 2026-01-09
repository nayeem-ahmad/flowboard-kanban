# Story 3.3: Team Member List and Roles

## Status
Completed

## Story
**As a** project owner,  
**I want** to view and manage team members,  
**so that** I can control project access.

## Acceptance Criteria
1. Project info modal shows team members list
2. Each member shows avatar, name, email, and role
3. Owner is clearly indicated
4. Member roles include: owner, admin, member
5. Members can be removed by owner/admin
6. Team count badge shows total members

## Tasks / Subtasks
- [ ] Task 1: Member Data Handling
  - [ ] Fetch user profiles for all member IDs in project
  - [ ] Define role types in code (`OWNER`, `ADMIN`, `MEMBER`)

- [ ] Task 2: Member List UI
  - [ ] Create "Team" tab/section in Project Settings
  - [ ] Render list items with Avatar, Name, Email, Role badge
  - [ ] Add "Remove" button (conditional on permissions)

- [ ] Task 3: Management Actions
  - [ ] Implement "Remove Member" logic
  - [ ] (Optional) Implement "Change Role" logic
  - [ ] Persist changes to Firestore

## Dev Notes
- Ensure one cannot remove themselves if they are the only owner.
- Optimizing user profile fetching (batch fetch or cache) is important for performance.

# Story 3.5: Card Comments

## Status
Completed

## Story
**As a** team member,  
**I want** to add comments to cards,  
**so that** I can discuss work with teammates.

## Acceptance Criteria
1. Card modal shows comments section
2. Text input allows adding new comment
3. Comments show author, timestamp, and content
4. Comments are ordered newest-first or oldest-first (toggle)
5. Comment author can delete their own comments
6. Comments persist with card data

## Tasks / Subtasks
- [ ] Task 1: Data Model
  - [ ] Define `Comment` schema (id, authorId, content, createdAt)
  - [ ] Add `comments` array to Card schema (or subcollection)

- [ ] Task 2: Comment Section UI
  - [ ] Add Comments area to Card Modal
  - [ ] Create "Add Comment" text area + submit button
  - [ ] Render list of existing comments (with Author info & relative time)

- [ ] Task 3: Comment Actions
  - [ ] Implement Add Comment logic
  - [ ] Implement Delete Comment logic (permission check: author only)

- [ ] Task 4: Real-time Updates
  - [ ] Ensure comments update in real-time for open modals

## Dev Notes
- Use `date-fns` `formatDistanceToNow` for friendly timestamps (e.g., "2 hours ago").
- If comments are expected to be numerous, a subcollection `cards/{cardId}/comments` is better than an array.

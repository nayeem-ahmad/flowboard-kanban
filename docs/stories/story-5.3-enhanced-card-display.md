# Story 5.3: Enhanced Card Display

## Status
Draft

## Story
**As a** user,  
**I want** cards to show key info at a glance,  
**so that** I can scan the board efficiently.

## Acceptance Criteria
1. Cards show labels as colored bars at top
2. Cards show due date with appropriate styling
3. Cards show checklist progress if items exist
4. Cards show time badge if hours tracked
5. Cards show assignee avatar
6. Cards show comment count if comments exist
7. Cards show attachment icon if files attached

## Tasks / Subtasks
- [ ] Task 1: Component Layout Update
  - [ ] Refactor `createCardElement` (or equivalent component) to support new metadata
  - [ ] Create a "Card Badges" container at bottom of card

- [ ] Task 2: Badge Implementation
  - [ ] **Time Badge:** Show `remainingHours` (e.g., "2h")
  - [ ] **Checklist Badge:** Show "X/Y" completed (e.g., icon + "3/5")
  - [ ] **Comments Badge:** Show icon + count if > 0
  - [ ] **Attachments Badge:** Show paperclip icon + count if > 0

- [ ] Task 3: Assignee & Date Display
  - [ ] **Assignee:** Position small avatar in bottom-right corner
  - [ ] **Due Date:** Position next to badges, color-coded (red for overdue, orange for soon)

- [ ] Task 4: Styling & Polish
  - [ ] Ensure text fits and doesn't clutter the card
  - [ ] Ensure sufficient contrast for accessibility

## Dev Notes
- This story aggregates display logic from previous features; ensure it handles missing data gracefully.

# Story 2.4: Sprint Properties (Dates and Goal)

## Status
Draft

## Story
**As a** scrum master,  
**I want** to set sprint start/end dates and goal,  
**so that** I can define sprint boundaries.

## Acceptance Criteria
1. Board/sprint has start date and end date fields
2. Board/sprint has goal text field
3. Sprint dates display in board info
4. Sprint goal displays in board header or info modal
5. Dates are used for burndown chart timeline
6. Sprint duration calculates automatically

## Tasks / Subtasks
- [ ] Task 1: Data Model Updates
  - [ ] Add `startDate`, `endDate`, `goal` fields to Board document
  - [ ] Update `createBoard` and `updateBoard` functions

- [ ] Task 2: Sprint Settings UI
  - [ ] Add/Update "Board Settings" or "Sprint Info" modal
  - [ ] Add Date Range Picker inputs
  - [ ] Add Goal text area

- [ ] Task 3: Board Header Display
  - [ ] Show Sprint Goal in Header (or prominent place)
  - [ ] Show Sprint Dates/Duration in Header

- [ ] Task 4: Burndown Integration
  - [ ] Update Burndown Chart to use Sprint Start/End dates for X-axis
  - [ ] Handle cases where current date is outside sprint range

## Dev Notes
- Date handling should use a library like `date-fns` or native `Intl` if simple enough.
- Ensure consistent date formatting.

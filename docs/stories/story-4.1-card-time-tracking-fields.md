# Story 4.1: Card Time Tracking Fields

## Status
Draft

## Story
**As a** developer,  
**I want** to log initial estimate and remaining hours on cards,  
**so that** my team can track effort.

## Acceptance Criteria
1. Card modal shows "Initial Estimate (hrs)" number input
2. Card modal shows "Remaining (hrs)" number input
3. Values accept decimal (0.5 increments)
4. Time badge appears on card if hours > 0
5. Remaining hours can be updated independently
6. Zero remaining indicates complete

## Tasks / Subtasks
- [ ] Task 1: Card Data Model Update
  - [ ] Add `initialEstimate` (number) and `remainingHours` (number) fields to Card schema
  - [ ] Default these fields to 0 or null

- [ ] Task 2: Card Modal UI
  - [ ] Add number input fields for "Initial Estimate (hrs)" and "Remaining (hrs)" in the card modal
  - [ ] Implement input validation to accept numbers and decimals (e.g., allow `0.5`, `1`, `1.5`)
  - [ ] Ensure input fields are pre-populated with existing card data

- [ ] Task 3: Card Display Updates
  - [ ] Add logic to `createCardElement` to display a time badge (e.g., total remaining hours) if `remainingHours > 0`
  - [ ] Style the time badge clearly (e.g., icon + number)

- [ ] Task 4: Persistence
  - [ ] Update `saveCard` logic to persist `initialEstimate` and `remainingHours` to Firestore
  - [ ] Ensure independent updates: changing remaining hours does not affect initial estimate unless explicitly linked by user action (e.g., "set remaining to estimate")

## Dev Notes
- Consider a simple spinner for hour input or direct text input with validation.
- The `remainingHours` field could automatically be set to `initialEstimate` when the card is first created or estimated.

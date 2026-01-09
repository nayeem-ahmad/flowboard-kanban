# Story 3.6: Shareable Card URLs

## Status
Draft

## Story
**As a** user,  
**I want** to share a direct link to a card,  
**so that** teammates can jump directly to it.

## Acceptance Criteria
1. Card modal shows "Share" or "Copy Link" action
2. URL format includes board ID and card ID
3. Visiting URL opens board with card modal active
4. URL works for all team members with access
5. Non-members see access denied message
6. Invalid card URLs show not-found message

## Tasks / Subtasks
- [ ] Task 1: URL Routing/Parsing
  - [ ] Define URL structure: `app/?project=...&board=...&card=<cardId>`
  - [ ] Implement logic on app load to check for `card` param

- [ ] Task 2: Deep Linking Logic
  - [ ] After board loads, find card by ID
  - [ ] If found, automatically trigger `openCardModal`

- [ ] Task 3: UI Actions
  - [ ] Add "Copy Link" button to Card Modal header
  - [ ] Copy correct deep link to clipboard
  - [ ] Show toast "Link copied"

## Dev Notes
- Ensure race conditions are handled (wait for board data to load before trying to open card).

# Story 4.2: List Hour Totals

## Status
Completed

## Story
**As a** scrum master,  
**I want** to see total hours per list,  
**so that** I can gauge column workload.

## Acceptance Criteria
1. List header shows total initial estimate badge
2. List header shows total remaining hours badge
3. Badges update when cards are added/moved/edited
4. Different styling distinguishes estimate vs remaining
5. Tooltips explain badge meanings

## Tasks / Subtasks
- [ ] Task 1: Calculation Logic
  - [ ] Implement a function to calculate sum of `initialEstimate` for all cards in a list
  - [ ] Implement a function to calculate sum of `remainingHours` for all cards in a list

- [ ] Task 2: UI Integration in List Header
  - [ ] Modify `createListElement` in `board.js` to call these calculation functions
  - [ ] Display the calculated totals as badges in the list header

- [ ] Task 3: Real-time Updates
  - [ ] Ensure `renderBoard()` is called or specific list elements are re-rendered when a card is added, removed, moved between lists, or its time tracking fields are updated.
  - [ ] Implement efficient updates to avoid full re-render if only badge numbers change.

- [ ] Task 4: Styling & Tooltips
  - [ ] Apply distinct CSS classes for initial estimate and remaining hours badges (e.g., different colors/icons)
  - [ ] Add tooltips to the badges (e.g., using `title` attribute) to explain what each number represents

## Dev Notes
- Performance: Ensure calculations are not overly expensive, especially with many cards/lists.
- Consider memoization for calculation results if needed.

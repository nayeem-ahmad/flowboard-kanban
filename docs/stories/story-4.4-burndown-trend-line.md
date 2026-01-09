# Story 4.4: Burndown Trend Line

## Status
Completed

## Story
**As a** scrum master,  
**I want** to see an ideal trend line on the burndown,  
**so that** I can compare actual vs expected progress.

## Acceptance Criteria
1. Chart shows ideal burndown line (start total to zero)
2. Ideal line is dashed/styled differently from actual
3. Chart shows actual progress line from historical data
4. Legend indicates ideal vs actual lines
5. Intersection/divergence is visually clear

## Tasks / Subtasks
- [ ] Task 1: Calculate Ideal Burndown Data
  - [ ] Determine total initial estimate for the sprint (sum of all cards' `initialEstimate` at sprint start)
  - [ ] Calculate daily decrement needed to reach zero by sprint end date
  - [ ] Generate an array of data points for the ideal line (starting from total estimate, ending at zero on sprint end)

- [ ] Task 2: Chart.js Dataset Integration
  - [ ] Add a second dataset to the Chart.js configuration for the ideal burndown line
  - [ ] Configure line styling (e.g., `borderDash`, `borderColor`, `fill: false`) for the ideal line

- [ ] Task 3: Chart Legend
  - [ ] Ensure Chart.js legend is configured to clearly show "Actual Burndown" and "Ideal Burndown"
  - [ ] Customize legend styling if needed for clarity

- [ ] Task 4: Visual Clarity
  - [ ] Adjust chart options (e.g., grid lines, tooltips) to enhance readability and highlight the comparison between actual and ideal progress.

## Dev Notes
- Ensure the ideal line calculation accurately reflects the sprint duration and total work.
- Consider edge cases like very short sprints or zero-estimate sprints.

# Story 4.3: Burndown Chart Panel

## Status
Completed

## Story
**As a** scrum master,  
**I want** to see a burndown chart for the sprint,  
**so that** I can track progress against timeline.

## Acceptance Criteria
1. Floating burndown panel appears on board view
2. Panel header shows total remaining hours
3. Chart plots remaining hours on Y-axis
4. Chart plots sprint days on X-axis (start to end date)
5. Panel can be collapsed to header-only view
6. Panel can be dragged/repositioned (optional)

## Tasks / Subtasks
- [ ] Task 1: Panel Structure
  - [ ] Create HTML structure for a floating, draggable panel (e.g., `div` with `position: fixed`)
  - [ ] Add header to the panel with a title and a collapse/expand button
  - [ ] Integrate Chart.js canvas element within the panel body

- [ ] Task 2: Chart Data Provision
  - [ ] Implement a function to gather `remainingHours` data points from `state` for plotting (Y-axis)
  - [ ] Implement a function to generate sprint day labels based on sprint `startDate` and `endDate` (X-axis)

- [ ] Task 3: Chart Initialization & Rendering
  - [ ] Initialize Chart.js instance with gathered data and appropriate chart type (line chart)
  - [ ] Render the chart within the panel when the board loads
  - [ ] Update the chart dynamically when sprint data changes

- [ ] Task 4: Panel Functionality
  - [ ] Implement collapse/expand functionality for the panel content
  - [ ] (Optional) Implement drag-and-drop for repositioning the panel on the screen using standard HTML Drag & Drop API or a library

## Dev Notes
- The `board.js` already includes `Chart.js`, so reuse the existing implementation.
- Focus on making the panel non-intrusive and user-friendly.

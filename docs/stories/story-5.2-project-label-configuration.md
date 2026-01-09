# Story 5.2: Project Label Configuration

## Status
Draft

## Story
**As a** project owner,  
**I want** to define label colors and meanings,  
**so that** team uses consistent categorization.

## Acceptance Criteria
1. Project settings include label configuration
2. Each label has color and meaning/name text
3. Default labels provided (e.g., Priority, Bug, Feature)
4. Labels can be added, edited, deleted
5. Card label picker shows configured labels
6. Label meaning displays on hover

## Tasks / Subtasks
- [ ] Task 1: Label Data Structure
  - [ ] Define `Label` schema (`{id, color, name}`)
  - [ ] Add `labels` array to Project schema (replacing hardcoded board defaults if any)

- [ ] Task 2: Label Management UI
  - [ ] Create "Labels" tab/section in Project Settings
  - [ ] Implement list of current labels with color preview and name input
  - [ ] Add "Create New Label" functionality with color picker
  - [ ] Implement Delete/Edit actions

- [ ] Task 3: Integration with Card Modal
  - [ ] Update Card Label Picker to fetch labels from Project configuration
  - [ ] Display label name alongside color in picker

- [ ] Task 4: Integration with Board View
  - [ ] Render label bars on cards using Project-defined colors
  - [ ] Show label name on hover (tooltip)

## Dev Notes
- Migration strategy: If moving from hardcoded labels, ensure existing cards map correctly or provide defaults.

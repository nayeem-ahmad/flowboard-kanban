# Epic 5: Enhanced Card Features

**Goal**: Add file attachments to cards, implement project-level custom labels with meanings, and polish card interactions.

## Story 5.1: File Attachments on Cards
**As a** user,  
**I want** to attach files to cards,  
**so that** I can reference relevant documents.

**Acceptance Criteria:**
1. Card modal shows attachments section
2. File upload button allows selecting files
3. Files upload to Firebase Storage
4. Attachments display as list with filename and icon
5. Clicking attachment opens/downloads file
6. Attachments can be deleted
7. Image attachments show thumbnail preview

## Story 5.2: Project Label Configuration
**As a** project owner,  
**I want** to define label colors and meanings,  
**so that** team uses consistent categorization.

**Acceptance Criteria:**
1. Project settings include label configuration
2. Each label has color and meaning/name text
3. Default labels provided (e.g., Priority, Bug, Feature)
4. Labels can be added, edited, deleted
5. Card label picker shows configured labels
6. Label meaning displays on hover

## Story 5.3: Enhanced Card Display
**As a** user,  
**I want** cards to show key info at a glance,  
**so that** I can scan the board efficiently.

**Acceptance Criteria:**
1. Cards show labels as colored bars at top
2. Cards show due date with appropriate styling
3. Cards show checklist progress if items exist
4. Cards show time badge if hours tracked
5. Cards show assignee avatar
6. Cards show comment count if comments exist
7. Cards show attachment icon if files attached

---

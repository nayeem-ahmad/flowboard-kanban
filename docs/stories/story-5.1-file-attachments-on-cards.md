# Story 5.1: File Attachments on Cards

## Status
Draft

## Story
**As a** user,  
**I want** to attach files to cards,  
**so that** I can reference relevant documents.

## Acceptance Criteria
1. Card modal shows attachments section
2. File upload button allows selecting files
3. Files upload to Firebase Storage
4. Attachments display as list with filename and icon
5. Clicking attachment opens/downloads file
6. Attachments can be deleted
7. Image attachments show thumbnail preview

## Tasks / Subtasks
- [ ] Task 1: Data Model & Storage Setup
  - [ ] Configure Firebase Storage bucket and rules
  - [ ] Update `Card` model to include `attachments` array (`{id, name, url, type, addedAt}`)

- [ ] Task 2: Upload UI & Logic
  - [ ] Add "Attachments" section to Card Modal
  - [ ] Implement file input and upload handler
  - [ ] Show upload progress indicator
  - [ ] Save file metadata to card document on success

- [ ] Task 3: Attachment Display
  - [ ] Render list of attachments in modal
  - [ ] Show thumbnail for image types; generic icon for others
  - [ ] Implement "Delete" action (remove from Storage + Card doc)

- [ ] Task 4: Card View Indicator
  - [ ] Show paperclip icon on card tile if attachments exist

## Dev Notes
- Ensure distinct path in Storage: `attachments/{boardId}/{cardId}/{filename}`
- Validate file size/type if needed.

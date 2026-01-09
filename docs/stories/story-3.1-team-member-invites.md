# Story 3.1: Team Member Invites

## Status
Completed

## Story
**As a** project owner,  
**I want** to invite team members using a shareable link,  
**so that** others can collaborate on my project.

## Acceptance Criteria
1. Project info modal shows invite link section
2. Invite link contains unique token and board/project ID
3. Link can be copied to clipboard with one click
4. Link can be regenerated (invalidating old links)
5. Regeneration requires confirmation
6. Invite description explains the link's purpose

## Tasks / Subtasks
- [ ] Task 1: Invite Token Generation
  - [ ] Add `inviteToken` field to Project/Board model
  - [ ] Implement token generation logic (e.g., UUID or random string)
  - [ ] Create function to generate full invite URL

- [ ] Task 2: Invite UI in Project Settings
  - [ ] Add "Invite Team" section to Project Management/Settings modal
  - [ ] Display current invite link (readonly input)
  - [ ] Add "Copy Link" button
  - [ ] Add "Regenerate Link" button

- [ ] Task 3: Logic Implementation
  - [ ] Implement "Copy" functionality using Clipboard API
  - [ ] Implement "Regenerate" functionality with confirmation dialog
  - [ ] Persist new token to Firestore immediately

## Dev Notes
- Ensure the token is secure enough (long random string).
- Invite link format: `app_url/?invite=<token>&project=<id>`

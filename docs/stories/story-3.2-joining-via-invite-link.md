# Story 3.2: Joining via Invite Link

## Status
Draft

## Story
**As a** team member,  
**I want** to join a project by clicking an invite link,  
**so that** I can collaborate with the team.

## Acceptance Criteria
1. Visiting invite URL while logged in processes join
2. User is added to project/board member list
3. User sees success toast notification
4. Invalid/expired tokens show error message
5. Already-member users see appropriate message
6. After joining, user is redirected to board

## Tasks / Subtasks
- [ ] Task 1: Invite Link Parsing
  - [ ] Parse URL parameters (`invite`, `project`/`board`) on app init
  - [ ] Detect if user is authenticated; if not, redirect to login (store invite ref)

- [ ] Task 2: Join Logic
  - [ ] Validate token against Project's stored token
  - [ ] Add user ID to Project's `members` array if valid
  - [ ] Add user ID to all Boards within the Project (if applicable)

- [ ] Task 3: UI Feedback
  - [ ] Show "Joining..." loader
  - [ ] Show success/error toast messages
  - [ ] Redirect to the Project/Board view upon success

## Dev Notes
- Handle the case where user needs to sign up/login first. The invite parameters should persist through the auth flow.

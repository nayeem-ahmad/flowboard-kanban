# Epic 3: Team Collaboration & Sharing

**Goal**: Enable team collaboration with invite links, member management, card assignees, comments on cards, and shareable card URLs.

## Story 3.1: Team Member Invites
**As a** project owner,  
**I want** to invite team members using a shareable link,  
**so that** others can collaborate on my project.

**Acceptance Criteria:**
1. Project info modal shows invite link section
2. Invite link contains unique token and board/project ID
3. Link can be copied to clipboard with one click
4. Link can be regenerated (invalidating old links)
5. Regeneration requires confirmation
6. Invite description explains the link's purpose

## Story 3.2: Joining via Invite Link
**As a** team member,  
**I want** to join a project by clicking an invite link,  
**so that** I can collaborate with the team.

**Acceptance Criteria:**
1. Visiting invite URL while logged in processes join
2. User is added to project/board member list
3. User sees success toast notification
4. Invalid/expired tokens show error message
5. Already-member users see appropriate message
6. After joining, user is redirected to board

## Story 3.3: Team Member List and Roles
**As a** project owner,  
**I want** to view and manage team members,  
**so that** I can control project access.

**Acceptance Criteria:**
1. Project info modal shows team members list
2. Each member shows avatar, name, email, and role
3. Owner is clearly indicated
4. Member roles include: owner, admin, member
5. Members can be removed by owner/admin
6. Team count badge shows total members

## Story 3.4: Card Assignee Selection
**As a** user,  
**I want** to assign cards to team members,  
**so that** ownership is clear.

**Acceptance Criteria:**
1. Card modal shows assignee dropdown
2. Dropdown lists all project team members
3. Selecting member assigns them to card
4. Assignee displays on card with avatar
5. Assignee can be cleared (unassigned)
6. Only one assignee per card

## Story 3.5: Card Comments
**As a** team member,  
**I want** to add comments to cards,  
**so that** I can discuss work with teammates.

**Acceptance Criteria:**
1. Card modal shows comments section
2. Text input allows adding new comment
3. Comments show author, timestamp, and content
4. Comments are ordered newest-first or oldest-first (toggle)
5. Comment author can delete their own comments
6. Comments persist with card data

## Story 3.6: Shareable Card URLs
**As a** user,  
**I want** to share a direct link to a card,  
**so that** teammates can jump directly to it.

**Acceptance Criteria:**
1. Card modal shows "Share" or "Copy Link" action
2. URL format includes board ID and card ID
3. Visiting URL opens board with card modal active
4. URL works for all team members with access
5. Non-members see access denied message
6. Invalid card URLs show not-found message

---

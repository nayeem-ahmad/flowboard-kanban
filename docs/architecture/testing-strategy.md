# Testing Strategy

## Testing Levels

| Level | Scope | Tools | Coverage Target |
|-------|-------|-------|----------------|
| **Manual Testing** | Critical user flows | Browser DevTools | All features |
| **Unit Testing** | Utility functions, validators | Vitest (future) | 80% of utils.js |
| **Integration Testing** | Firebase operations | Vitest + Firebase Emulator | Core CRUD ops |
| **E2E Testing** | User journeys | Playwright (future) | Critical paths |

## Manual Testing Checklist

**Authentication:**
- [ ] Email/password registration
- [ ] Email/password login
- [ ] Google OAuth login
- [ ] GitHub OAuth login
- [ ] Password reset flow
- [ ] Session persistence across refresh
- [ ] Logout clears state

**Board Operations:**
- [ ] Create new board
- [ ] Switch between boards
- [ ] Change board background
- [ ] Delete board

**List Operations:**
- [ ] Add list
- [ ] Rename list (inline edit)
- [ ] Reorder lists (drag)
- [ ] Delete list
- [ ] Copy list
- [ ] Clear list cards

**Card Operations:**
- [ ] Add card (quick add)
- [ ] Edit card (modal)
- [ ] Drag card between lists
- [ ] Drag card within list (reorder)
- [ ] Add/complete checklist items
- [ ] Set due date
- [ ] Add labels
- [ ] Set assignee
- [ ] Time tracking fields
- [ ] Duplicate card
- [ ] Delete card

**Project & Team:**
- [ ] Create project
- [ ] Switch projects
- [ ] Generate invite link
- [ ] Join via invite link
- [ ] View team members

**Burndown Chart:**
- [ ] Chart displays with data
- [ ] Updates when hours change
- [ ] Collapse/expand panel

**Offline & Sync:**
- [ ] Works offline (localStorage)
- [ ] Syncs when online
- [ ] Multi-tab consistency

**Theme:**
- [ ] Toggle light/dark mode
- [ ] Persists across sessions
- [ ] Respects system preference

## Automated Testing (Future)

```javascript
// Example unit tests for utils.js (Vitest)
import { describe, it, expect } from 'vitest';
import { generateId, validators } from './utils.js';

describe('generateId', () => {
    it('returns a string', () => {
        expect(typeof generateId()).toBe('string');
    });
    it('returns unique values', () => {
        const ids = new Set(Array(100).fill(0).map(() => generateId()));
        expect(ids.size).toBe(100);
    });
});

describe('validators', () => {
    it('validates required fields', () => {
        expect(validators.required('test')).toBe(true);
        expect(validators.required('')).toBe(false);
        expect(validators.required('   ')).toBe(false);
    });
    it('validates email format', () => {
        expect(validators.isEmail('user@example.com')).toBe(true);
        expect(validators.isEmail('invalid')).toBe(false);
    });
});
```

---

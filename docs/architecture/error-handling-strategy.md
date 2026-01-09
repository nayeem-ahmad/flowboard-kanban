# Error Handling Strategy

Consistent error handling across all modules ensures a good user experience and easier debugging.

## Error Categories

| Category | Example | Handling Approach |
|----------|---------|-------------------|
| **Network Errors** | Firestore offline, timeout | Show toast, use localStorage fallback, retry with exponential backoff |
| **Auth Errors** | Invalid credentials, session expired | Show specific error message, redirect to login if needed |
| **Permission Errors** | Firestore rules denied | Show "Access denied" toast, log for debugging |
| **Validation Errors** | Empty title, invalid date | Inline field validation, prevent submission |
| **Storage Errors** | Upload failed, file too large | Show error toast with specific message |

## Error Handling Patterns

```javascript
// Pattern 1: Try-catch with user feedback
try {
    await db.collection('boards').doc(boardId).set(data);
    showToast('Board saved!', 'success');
} catch (error) {
    console.error('Save failed:', error);
    if (error.code === 'permission-denied') {
        showToast('You don\'t have permission to edit this board', 'error');
    } else if (error.code === 'unavailable') {
        showToast('Offline - changes saved locally', 'warning');
        saveToLocalStorage(data);
    } else {
        showToast('Failed to save. Please try again.', 'error');
    }
}

// Pattern 2: Auth error handling
auth.onAuthStateChanged((user) => {
    if (!user) {
        // Session expired or logged out
        clearLocalState();
        showAuthScreen();
    }
});

// Pattern 3: Graceful degradation
const loadBoard = async (boardId) => {
    try {
        const doc = await db.collection('boards').doc(boardId).get();
        return doc.data();
    } catch (error) {
        console.warn('Firestore unavailable, using cache:', error);
        return getFromLocalStorage(boardId);
    }
};
```

## Module-Specific Error Handling

| Module | Key Error Scenarios | Handling |
|--------|---------------------|----------|
| `auth.js` | Login failure, OAuth popup blocked, password reset | Show specific error messages, offer alternatives |
| `store.js` | Firestore sync failure, quota exceeded | Fallback to localStorage, queue for retry |
| `board.js` | Drag-drop state inconsistency, render failure | Re-render board, show error toast |
| `project.js` | Invite link invalid, member add failure | Validate before action, show clear errors |

---

# Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /attachments/{boardId}/{cardId}/{fileName} {
      // Allow read if authenticated (simplified - enhance with member check)
      allow read: if request.auth != null;
      
      // Allow write if authenticated and file is under 10MB
      allow write: if request.auth != null 
        && request.resource.size < 10 * 1024 * 1024;
      
      // Allow delete if authenticated
      allow delete: if request.auth != null;
    }
  }
}
```

---

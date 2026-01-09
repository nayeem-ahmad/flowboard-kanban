# Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper to check if user email is in member list
    function isMember(memberEmails) {
      return request.auth.token.email in memberEmails;
    }
    
    // User profiles - users can only read/write their own
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Projects - members can read, owners can write
    match /projects/{projectId} {
      allow read: if isAuthenticated() && isMember(resource.data.memberEmails);
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        (resource.data.ownerId == request.auth.uid || 
         isMember(resource.data.memberEmails));
    }
    
    // Boards - members can read/write
    match /boards/{boardId} {
      allow read: if isAuthenticated() && isMember(resource.data.memberEmails);
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        isMember(resource.data.memberEmails);
    }
  }
}
```

---

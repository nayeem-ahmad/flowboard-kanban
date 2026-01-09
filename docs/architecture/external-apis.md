# External APIs

## Firebase Authentication API

- **Purpose:** User authentication and session management
- **Documentation:** https://firebase.google.com/docs/auth/web/start
- **Base URL(s):** Managed by SDK
- **Authentication:** API Key + OAuth
- **Rate Limits:** 100 accounts/IP/hour (free tier)

**Key Methods Used:**
- `createUserWithEmailAndPassword(email, password)`
- `signInWithEmailAndPassword(email, password)`
- `signInWithPopup(provider)` - Google/GitHub
- `signOut()`
- `sendPasswordResetEmail(email)`
- `onAuthStateChanged(callback)`

---

## Firestore API

- **Purpose:** Real-time document database
- **Documentation:** https://firebase.google.com/docs/firestore
- **Base URL(s):** Managed by SDK
- **Authentication:** Firebase Auth token
- **Rate Limits:** 50K reads/day, 20K writes/day (free tier)

**Key Operations Used:**
- `collection().doc().get()` - Read document
- `collection().doc().set()` - Write document
- `collection().where().get()` - Query documents
- `collection().onSnapshot()` - Real-time listener

**Collections:**
- `users/{uid}` - User profiles
- `projects/{projectId}` - Projects
- `boards/{boardId}` - Boards/Sprints

---

## Firebase Storage API

- **Purpose:** File attachment storage
- **Documentation:** https://firebase.google.com/docs/storage/web/start
- **Base URL(s):** `gs://scrum71.appspot.com`
- **Authentication:** Firebase Auth token
- **Rate Limits:** 1GB storage, 5GB/day downloads (free tier)

**Key Operations Used:**
- `ref().put(file)` - Upload file
- `ref().getDownloadURL()` - Get public URL
- `ref().delete()` - Remove file

**Storage Structure:**
```
/attachments/{boardId}/{cardId}/{filename}
```

---

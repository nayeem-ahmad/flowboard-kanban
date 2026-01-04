# Firebase Setup Guide for FlowBoard

## ✅ Firebase is Already Configured!

This project is pre-configured with Firebase using the **ai-readiness-checker** project.

### Current Configuration

| Setting | Value |
|---------|-------|
| **Project ID** | `ai-readiness-checker` |
| **Auth Domain** | `ai-readiness-checker.firebaseapp.com` |
| **App ID** | `1:409159590979:web:240e5c9aa1ca66df0c20f6` |

### Enabled Features

- ✅ **Email/Password Authentication** - Sign in with email and password
- ✅ **Google Sign-In** - One-click Google authentication
- ✅ **Firestore Database** - Real-time data sync in production mode
- ✅ **Authorized Domains** - `nayeem-ahmad.github.io` is whitelisted for GitHub Pages

---

## Running Locally

Just open `index.html` in your browser or start a local server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node (if http-server is installed)
npx http-server -p 8080
```

Then navigate to `http://localhost:8080`

---

## Deploying to GitHub Pages

The app is already configured for GitHub Pages deployment at:
`https://nayeem-ahmad.github.io/flowboard-kanban/`

Just push your changes to the repository and GitHub Pages will automatically deploy.

---

## Firebase CLI Commands

```bash
# View current project
firebase projects:list

# Deploy Firestore rules
firebase deploy --only firestore:rules --project ai-readiness-checker

# Deploy everything (hosting + rules)
firebase deploy --project ai-readiness-checker
```

---

## GitHub Sign-In (Optional)

To enable GitHub sign-in, you'll need to:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App with:
   - **Homepage URL**: `https://nayeem-ahmad.github.io/flowboard-kanban/`
   - **Authorization callback URL**: `https://ai-readiness-checker.firebaseapp.com/__/auth/handler`
3. Copy the Client ID and Client Secret
4. Go to [Firebase Console > Authentication > Sign-in method](https://console.firebase.google.com/project/ai-readiness-checker/authentication/providers)
5. Enable GitHub and paste the Client ID and Secret

---

## Firestore Security Rules

The current rules (`firestore.rules`) ensure each user can only access their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Troubleshooting

### "Firebase not configured" Warning
If you see this warning in the console, the app is falling back to localStorage mode. Check that the Firebase config in `app.js` is correct.

### Authentication Errors
- Make sure the domain you're using is added to [Authorized domains](https://console.firebase.google.com/project/ai-readiness-checker/authentication/settings)
- Clear browser cache and try again

### Firestore Permission Denied
- Check that you're signed in before reading/writing data
- Verify the security rules are deployed: `firebase deploy --only firestore:rules`

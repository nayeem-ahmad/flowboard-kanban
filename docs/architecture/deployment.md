# Deployment

## Firebase Hosting Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize (already done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## GitHub Pages Alternative

The app can also be deployed to GitHub Pages:
1. Push to `main` branch
2. Enable GitHub Pages in repository settings
3. Set source to root directory

---

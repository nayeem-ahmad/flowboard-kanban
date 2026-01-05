// FlowBoard - Trello-like Kanban Board Application with Firebase
// =============================================================

// ================================
// FIREBASE CONFIGURATION
// ================================
// Firebase configuration for FlowBoard (using scrum71 project)
const firebaseConfig = {
    apiKey: "AIzaSyAeW96tQLnWeqah7NO8zGOHlfi31nDHOQw",
    authDomain: "scrum71.firebaseapp.com",
    projectId: "scrum71",
    storageBucket: "scrum71.firebasestorage.app",
    messagingSenderId: "744464444206",
    appId: "1:744464444206:web:77995ba24fce2e57a228bf",
    measurementId: "G-KJF2BWTCWL"
};

// Initialize Firebase
let auth, db;
let isFirebaseConfigured = false;

try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        isFirebaseConfigured = true;
    } else {
        console.warn('⚠️ Firebase not configured. Using localStorage fallback.');
        console.info('To enable cloud sync and authentication, replace the firebaseConfig in app.js with your Firebase project credentials.');
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// ================================
// UTILITY FUNCTIONS
// ================================
const generateId = () => Math.random().toString(36).substring(2, 15);

const generateUniqueProjectName = () => {
    const adjectives = ['Alpha', 'Beta', 'Cosmic', 'Delta', 'Echo', 'Flow', 'Gamma', 'Hyper', 'Ionic', 'Lunar', 'Neon', 'Omega', 'Prime', 'Rapid', 'Solar', 'Terra', 'Ultra', 'Velocity', 'Zenith'];
    const nouns = ['Board', 'Core', 'Deck', 'Grid', 'Hub', 'Lab', 'Matrix', 'Nexus', 'Orbit', 'Pad', 'Project', 'Space', 'Sphere', 'Station', 'Stream', 'System', 'Vault', 'Zone'];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 99) + 1;

    return `${adj} ${noun} ${num}`;
};

// Toast Notifications
const showToast = (message, type = 'info') => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
        error: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M15 9L9 15M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        warning: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2"/><path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        info: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    };

    toast.innerHTML = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none">${icons[type]}</svg>
        <span class="toast-message">${message}</span>
        <button class="toast-close"><svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    `;

    container.appendChild(toast);
    toast.querySelector('.toast-close').onclick = () => removeToast(toast);
    setTimeout(() => removeToast(toast), 4000);
};

const removeToast = (toast) => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
};

// ================================
// DATA STORE
// ================================
let state = {
    boards: [],
    currentBoardId: null,
    editingCard: null
};

let currentUser = null;

// ================================
// SAMPLE DATA
// ================================
const initializeSampleData = () => {
    const sampleBoard = {
        id: generateId(),
        name: 'My Project Board',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        owner: {
            id: 'owner-1',
            name: 'You',
            email: 'you@example.com',
            photoURL: null
        },
        members: [
            {
                id: 'member-1',
                name: 'Sarah Chen',
                email: 'sarah.chen@example.com',
                photoURL: null,
                role: 'member',
                addedAt: new Date().toISOString()
            },
            {
                id: 'member-2',
                name: 'Alex Johnson',
                email: 'alex.j@example.com',
                photoURL: null,
                role: 'member',
                addedAt: new Date().toISOString()
            }
        ],
        lists: [
            {
                id: generateId(),
                title: 'To Do',
                cards: [
                    { id: generateId(), title: 'Research competitor products', description: 'Analyze top 5 competitors', labels: ['priority-high'], dueDate: '2026-01-10', checklist: [{ id: generateId(), text: 'Find competitors', completed: true }, { id: generateId(), text: 'Analyze features', completed: false }], initialEstimate: 8, remainingHours: 5 },
                    { id: generateId(), title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity designs', labels: ['feature'], dueDate: '', checklist: [], initialEstimate: 16, remainingHours: 16 },
                    { id: generateId(), title: 'Set up development environment', description: '', labels: ['improvement'], dueDate: '2026-01-08', checklist: [], initialEstimate: 4, remainingHours: 2 }
                ]
            },
            {
                id: generateId(),
                title: 'In Progress',
                cards: [
                    { id: generateId(), title: 'Implement user authentication', description: 'OAuth2 and email/password login', labels: ['feature', 'priority-medium'], dueDate: '2026-01-15', checklist: [{ id: generateId(), text: 'Set up OAuth', completed: true }, { id: generateId(), text: 'Email verification', completed: false }], initialEstimate: 24, remainingHours: 12 },
                    { id: generateId(), title: 'Create database schema', description: 'PostgreSQL with proper indexing', labels: ['priority-high'], dueDate: '', checklist: [], initialEstimate: 8, remainingHours: 6 }
                ]
            },
            {
                id: generateId(),
                title: 'Review',
                cards: [
                    { id: generateId(), title: 'API documentation', description: 'Swagger/OpenAPI specs', labels: ['improvement'], dueDate: '2026-01-07', checklist: [], initialEstimate: 6, remainingHours: 3 }
                ]
            },
            {
                id: generateId(),
                title: 'Done',
                cards: [
                    { id: generateId(), title: 'Project setup', description: 'Initial configuration complete', labels: ['priority-low'], dueDate: '', checklist: [], initialEstimate: 2, remainingHours: 0 },
                    { id: generateId(), title: 'Team kickoff meeting', description: 'Introductions and project overview', labels: [], dueDate: '', checklist: [], initialEstimate: 1, remainingHours: 0 }
                ]
            }
        ],
        history: [
            { date: '2026-01-01', remaining: 42 },
            { date: '2026-01-02', remaining: 38 },
            { date: '2026-01-03', remaining: 32 },
            { date: '2026-01-04', remaining: 29 }
        ]
    };

    state.boards = [sampleBoard];
    state.currentBoardId = sampleBoard.id;
};

// ================================
// DATA PERSISTENCE (Firestore + LocalStorage Fallback)
// ================================

const saveState = async () => {
    // Always save to localStorage as backup
    localStorage.setItem('flowboard-state', JSON.stringify(state));

    // If Firebase is configured and user is logged in, save to Firestore
    if (isFirebaseConfigured && currentUser) {
        try {
            // 1. Save preferences to user profile
            await db.collection('users').doc(currentUser.uid).set({
                currentBoardId: state.currentBoardId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // 2. Save CURRENT board to boards collection
            const currentBoard = getCurrentBoard();
            if (currentBoard) {
                // Prepare searchable member emails
                const memberEmails = [
                    currentBoard.owner?.email,
                    ...(currentBoard.members || []).map(m => m.email)
                ].filter(Boolean); // Remove null/undefined

                await db.collection('boards').doc(currentBoard.id).set({
                    ...currentBoard,
                    memberEmails, // For querying
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
        } catch (error) {
            console.error('Error saving to Firestore:', error);
            showToast('Failed to sync to cloud', 'warning');
        }
    }
};

const loadState = async () => {
    // If Firebase is configured and user is logged in, load from Firestore
    if (isFirebaseConfigured && currentUser) {
        try {
            // 1. Get User Preferences
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            let serverCurrentBoardId = null;
            if (userDoc.exists) {
                serverCurrentBoardId = userDoc.data().currentBoardId;
            }

            // 2. Query boards where user is a member (or owner)
            // Note: In Firestore, array-contains checks if the value exists in the array
            const boardsSnapshot = await db.collection('boards')
                .where('memberEmails', 'array-contains', currentUser.email)
                .get();

            const boards = [];
            boardsSnapshot.forEach(doc => {
                boards.push(doc.data());
            });

            // Set boards state (empty or not) to prevent localStorage fallback
            state.boards = boards;

            if (boards.length > 0) {
                state.currentBoardId = serverCurrentBoardId || boards[0].id;

                // If saved current board is not accessible/deleted, switch to first one
                if (!state.boards.find(b => b.id === state.currentBoardId)) {
                    state.currentBoardId = state.boards[0].id;
                }
            } else {
                // User has no boards. 
                // Check if they are here via an invite link
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('invite')) {
                    // Do NOT create sample data. Let handleInviteLink populate the board.
                    state.currentBoardId = null;
                } else {
                    // Normal new user? Create sample data
                    initializeSampleData();
                    // We should also save this new sample data to Firestore immediately so it persists
                    saveState();
                }
            }
            return;
        } catch (error) {
            console.error('Error loading from Firestore:', error);
        }
    }

    // Fallback to localStorage
    const saved = localStorage.getItem('flowboard-state');
    if (saved) {
        state = JSON.parse(saved);
        if (!state.boards.length) initializeSampleData();
    } else {
        initializeSampleData();
    }
};

// ================================
// AUTHENTICATION
// ================================
const loadingScreen = document.getElementById('loadingScreen');
const authScreen = document.getElementById('authScreen');
const headerElement = document.querySelector('.header');
const boardContainer = document.querySelector('.board-container');
const userAvatar = document.querySelector('.user-avatar');
const userMenu = document.getElementById('userMenu');

// Auth forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const resetForm = document.getElementById('resetForm');

// Switch between login/register tabs
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.dataset.tab === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            resetForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            resetForm.classList.add('hidden');
        }
    });
});

// Forgot password link
document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    resetForm.classList.remove('hidden');
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
});

// Back to login link
document.getElementById('backToLoginLink').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    resetForm.classList.add('hidden');
    document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
});

// Helper function for form loading state
const setFormLoading = (form, loading) => {
    const btn = form.querySelector('.btn-block');
    if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
};

// Email/Password Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isFirebaseConfigured) {
        showToast('Firebase not configured. Please set up Firebase first.', 'error');
        return;
    }

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    setFormLoading(loginForm, true);

    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Welcome back!', 'success');
    } catch (error) {
        console.error('Login error:', error);
        let message = 'Failed to sign in';
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/too-many-requests':
                message = 'Too many attempts. Please try again later';
                break;
        }
        showToast(message, 'error');
    } finally {
        setFormLoading(loginForm, false);
    }
});

// Email/Password Registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isFirebaseConfigured) {
        showToast('Firebase not configured. Please set up Firebase first.', 'error');
        return;
    }

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    setFormLoading(registerForm, true);

    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        await result.user.updateProfile({ displayName: name });
        showToast('Account created successfully!', 'success');
    } catch (error) {
        console.error('Registration error:', error);
        let message = 'Failed to create account';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists';
                break;
            case 'auth/weak-password':
                message = 'Password should be at least 6 characters';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
        }
        showToast(message, 'error');
    } finally {
        setFormLoading(registerForm, false);
    }
});

// Password Reset
resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isFirebaseConfigured) {
        showToast('Firebase not configured. Please set up Firebase first.', 'error');
        return;
    }

    const email = document.getElementById('resetEmail').value;

    setFormLoading(resetForm, true);

    try {
        await auth.sendPasswordResetEmail(email);
        showToast('Password reset email sent! Check your inbox.', 'success');
        // Go back to login form
        document.getElementById('backToLoginLink').click();
    } catch (error) {
        console.error('Password reset error:', error);
        let message = 'Failed to send reset email';
        if (error.code === 'auth/user-not-found') {
            message = 'No account found with this email';
        }
        showToast(message, 'error');
    } finally {
        setFormLoading(resetForm, false);
    }
});

// Google Sign-In
document.getElementById('googleSignIn').addEventListener('click', async () => {
    if (!isFirebaseConfigured) {
        showToast('Firebase not configured. Please set up Firebase first.', 'error');
        return;
    }

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        showToast('Signed in with Google!', 'success');
    } catch (error) {
        console.error('Google sign-in error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            showToast('Failed to sign in with Google', 'error');
        }
    }
});

// GitHub Sign-In
document.getElementById('githubSignIn').addEventListener('click', async () => {
    if (!isFirebaseConfigured) {
        showToast('Firebase not configured. Please set up Firebase first.', 'error');
        return;
    }

    try {
        const provider = new firebase.auth.GithubAuthProvider();
        await auth.signInWithPopup(provider);
        showToast('Signed in with GitHub!', 'success');
    } catch (error) {
        console.error('GitHub sign-in error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            if (error.code === 'auth/account-exists-with-different-credential') {
                showToast('An account already exists with this email', 'error');
            } else {
                showToast('Failed to sign in with GitHub', 'error');
            }
        }
    }
});

// User Menu Toggle
userAvatar.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target) && !userAvatar.contains(e.target)) {
        userMenu.classList.remove('active');
    }
});

// Sign Out
document.getElementById('signOutBtn').addEventListener('click', async () => {
    if (isFirebaseConfigured) {
        try {
            await auth.signOut();
            showToast('Signed out successfully', 'info');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }
    userMenu.classList.remove('active');
});

// Update UI for authenticated user
const updateUserUI = (user) => {
    const avatarEl = document.querySelector('.user-avatar');
    const menuAvatarEl = document.getElementById('userMenuAvatar');
    const menuNameEl = document.getElementById('userMenuName');
    const menuEmailEl = document.getElementById('userMenuEmail');

    if (user) {
        // User is signed in
        const displayName = user.displayName || 'User';
        const email = user.email || '';
        const photoURL = user.photoURL;
        const initial = displayName.charAt(0).toUpperCase();

        if (photoURL) {
            avatarEl.innerHTML = `<img src="${photoURL}" alt="${displayName}">`;
            menuAvatarEl.innerHTML = `<img src="${photoURL}" alt="${displayName}">`;
        } else {
            avatarEl.innerHTML = `<span>${initial}</span>`;
            menuAvatarEl.innerHTML = `<span>${initial}</span>`;
        }

        menuNameEl.textContent = displayName;
        menuEmailEl.textContent = email;
    } else {
        // User is signed out
        avatarEl.innerHTML = '<span>U</span>';
    }
};

// Auth state observer
const initAuth = () => {
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
            console.warn('Auth initialization timed out');
            loadingScreen.classList.add('hidden');
            document.getElementById('authScreen').classList.remove('hidden');
            showToast('Connection timed out. Please check your internet or try again.', 'warning');
        }
    }, 10000); // 10 seconds timeout

    if (isFirebaseConfigured) {
        auth.onAuthStateChanged(async (user) => {
            clearTimeout(safetyTimeout);
            currentUser = user;

            if (user) {
                // User is signed in
                updateUserUI(user);

                // Load user's data with timeout handling
                try {
                    // Create a promise that rejects after 5 seconds
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Data load timeout')), 5000)
                    );

                    // Race loadState against timeout
                    await Promise.race([loadState(), timeoutPromise]);
                } catch (error) {
                    console.error('Data loading issue:', error);
                    // Continue anyway to not block UI
                }

                // Show main app, hide auth
                loadingScreen.classList.add('hidden');
                authScreen.classList.add('hidden');
                headerElement.classList.remove('hidden');
                boardContainer.classList.remove('hidden');

                // Initialize theme and render
                initTheme();
                renderBoard();

                // If user has no boards, offer to create one with a unique proposed name
                if (state.boards.length === 0) {
                    const proposedName = generateUniqueProjectName();
                    boardModal.classList.add('active');
                    const nameInput = document.getElementById('boardName');
                    nameInput.value = proposedName;

                    // Allow UI to settle then select text
                    setTimeout(() => nameInput.select(), 100);

                    showToast('Welcome! Create your first project to get started.', 'info');
                }

                // Check for invite link
                handleInviteLink();
            } else {
                // User is signed out
                loadingScreen.classList.add('hidden');
                authScreen.classList.remove('hidden');
                headerElement.classList.add('hidden');
                boardContainer.classList.add('hidden');
            }
        });
    } else {
        clearTimeout(safetyTimeout);
        // Firebase not configured - skip auth and use localStorage
        loadingScreen.classList.add('hidden');
        authScreen.classList.add('hidden');
        headerElement.classList.remove('hidden');
        boardContainer.classList.remove('hidden');

        // Load from localStorage
        loadState();
        initTheme();
        renderBoard();
    }
};

// ================================
// GET CURRENT BOARD
// ================================
const getCurrentBoard = () => state.boards.find(b => b.id === state.currentBoardId);

// ================================
// DOM ELEMENTS
// ================================
const boardElement = document.getElementById('board');
const boardSelectorBtn = document.getElementById('boardSelectorBtn');
const boardSelector = boardSelectorBtn.parentElement;
const boardDropdown = document.getElementById('boardDropdown');
const boardList = document.getElementById('boardList');
const createBoardBtn = document.getElementById('createBoardBtn');
const currentBoardName = document.getElementById('currentBoardName');
const boardModal = document.getElementById('boardModal');
const cardModal = document.getElementById('cardModal');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const themeToggle = document.getElementById('themeToggle');

// ================================
// THEME TOGGLE
// ================================
const initTheme = () => {
    const saved = localStorage.getItem('flowboard-theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
};

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('flowboard-theme', isDark ? 'light' : 'dark');
});

// ================================
// BOARD SELECTOR
// ================================
boardSelectorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    boardSelector.classList.toggle('active');
    renderBoardList();
});

document.addEventListener('click', (e) => {
    if (!boardSelector.contains(e.target)) {
        boardSelector.classList.remove('active');
    }
});

const renderBoardList = () => {
    boardList.innerHTML = state.boards.map(board => `
        <button class="board-list-item ${board.id === state.currentBoardId ? 'active' : ''}" data-board-id="${board.id}">
            <div class="board-color-dot" style="background: ${board.background}"></div>
            <span class="board-item-name">${board.name}</span>
        </button>
    `).join('');

    boardList.querySelectorAll('.board-list-item').forEach(item => {
        item.addEventListener('click', () => {
            state.currentBoardId = item.dataset.boardId;
            saveState();
            renderBoard();
            boardSelector.classList.remove('active');
        });
    });
};

// ================================
// BOARD MODAL
// ================================
createBoardBtn.addEventListener('click', () => {
    boardModal.classList.add('active');
    document.getElementById('boardName').value = '';
    boardSelector.classList.remove('active');
});

document.getElementById('closeBoardModal').addEventListener('click', () => boardModal.classList.remove('active'));
document.getElementById('cancelBoardBtn').addEventListener('click', () => boardModal.classList.remove('active'));

document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
    });
});

document.getElementById('saveBoardBtn').addEventListener('click', () => {
    const name = document.getElementById('boardName').value.trim();
    const color = document.querySelector('.color-option.selected').dataset.color;

    if (!name) {
        document.getElementById('boardName').classList.add('shake');
        setTimeout(() => document.getElementById('boardName').classList.remove('shake'), 500);
        return;
    }

    const newBoard = {
        id: generateId(),
        name,
        background: color,
        owner: {
            id: currentUser?.uid || 'local-user',
            name: currentUser?.displayName || 'You',
            email: currentUser?.email || 'you@example.com',
            photoURL: currentUser?.photoURL || null
        },
        members: [],
        lists: []
    };

    state.boards.push(newBoard);
    state.currentBoardId = newBoard.id;
    saveState();
    renderBoard();
    boardModal.classList.remove('active');
    showToast('Board created successfully!', 'success');
});

// ================================
// SEARCH
// ================================
document.getElementById('searchBtn').addEventListener('click', () => {
    searchModal.classList.add('active');
    searchInput.focus();
});

searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) searchModal.classList.remove('active');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchModal.classList.remove('active');
        cardModal.classList.remove('active');
        boardModal.classList.remove('active');
        document.getElementById('projectInfoModal').classList.remove('active');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchModal.classList.add('active');
        searchInput.focus();
    }
});

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
        searchResults.innerHTML = '<div class="search-empty">Start typing to search cards...</div>';
        return;
    }

    const results = [];
    state.boards.forEach(board => {
        board.lists.forEach(list => {
            list.cards.forEach(card => {
                if (card.title.toLowerCase().includes(query) || card.description.toLowerCase().includes(query)) {
                    results.push({ card, list, board });
                }
            });
        });
    });

    if (!results.length) {
        searchResults.innerHTML = '<div class="search-empty">No cards found</div>';
        return;
    }

    searchResults.innerHTML = results.map(({ card, list, board }) => `
        <div class="search-result-item" data-card-id="${card.id}" data-list-id="${list.id}" data-board-id="${board.id}">
            <div class="search-result-icon">
                <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/></svg>
            </div>
            <div class="search-result-content">
                <div class="search-result-title">${card.title}</div>
                <div class="search-result-meta">in ${list.title} • ${board.name}</div>
            </div>
        </div>
    `).join('');

    searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.boardId !== state.currentBoardId) {
                state.currentBoardId = item.dataset.boardId;
                saveState();
                renderBoard();
            }
            searchModal.classList.remove('active');
            openCardModal(item.dataset.cardId, item.dataset.listId);
        });
    });
});

// ================================
// RENDER BOARD
// ================================
const renderBoard = () => {
    const board = getCurrentBoard();
    if (!board) {
        currentBoardName.textContent = 'No Project';
        boardElement.innerHTML = '<div class="empty-state">Create a board to get started</div>';
        document.documentElement.style.setProperty('--board-bg', '#f3f4f6');
        return;
    }

    currentBoardName.textContent = board.name;
    document.documentElement.style.setProperty('--board-bg', board.background);

    boardElement.innerHTML = '';

    board.lists.forEach(list => {
        const listEl = createListElement(list);
        boardElement.appendChild(listEl);
    });

    // Add "Add list" button
    const addListEl = document.createElement('div');
    addListEl.className = 'add-list';
    addListEl.innerHTML = `
        <button class="add-list-btn">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Add another list
        </button>
        <div class="add-list-form">
            <input type="text" class="add-list-input" placeholder="Enter list title...">
            <div class="add-list-actions">
                <button class="btn btn-primary add-list-save">Add List</button>
                <button class="btn-icon add-list-cancel">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
            </div>
        </div>
    `;

    const addListBtn = addListEl.querySelector('.add-list-btn');
    const addListForm = addListEl.querySelector('.add-list-form');
    const addListInput = addListEl.querySelector('.add-list-input');

    addListBtn.addEventListener('click', () => {
        addListBtn.style.display = 'none';
        addListForm.classList.add('active');
        addListInput.focus();
    });

    addListEl.querySelector('.add-list-cancel').addEventListener('click', () => {
        addListBtn.style.display = 'flex';
        addListForm.classList.remove('active');
        addListInput.value = '';
    });

    addListEl.querySelector('.add-list-save').addEventListener('click', () => {
        const title = addListInput.value.trim();
        if (title) {
            board.lists.push({ id: generateId(), title, cards: [] });
            saveState();
            renderBoard();
            showToast('List added!', 'success');
        }
    });

    addListInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addListEl.querySelector('.add-list-save').click();
        if (e.key === 'Escape') addListEl.querySelector('.add-list-cancel').click();
    });

    boardElement.appendChild(addListEl);
    initDragAndDrop();
    updateBurndownChart();
};

// ================================
// BURNDOWN CHART
// ================================
let burndownChart = null;

const updateBurndownChart = () => {
    const board = getCurrentBoard();
    if (!board) return;

    // Calculate total remaining
    let totalRemaining = 0;
    board.lists.forEach(list => {
        list.cards.forEach(card => {
            totalRemaining += parseFloat(card.remainingHours || 0);
        });
    });

    // Update UI text
    const totalEl = document.getElementById('totalRemainingValue');
    if (totalEl) totalEl.textContent = `${totalRemaining}h`;

    // Initialize history if missing
    if (!board.history) board.history = [];

    // Update history for today
    const today = new Date().toISOString().split('T')[0];
    const todayEntryIndex = board.history.findIndex(h => h.date === today);

    if (todayEntryIndex >= 0) {
        board.history[todayEntryIndex].remaining = totalRemaining;
    } else {
        board.history.push({ date: today, remaining: totalRemaining });
    }

    // Sort history by date
    board.history.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Save automatically to persist the history update
    // We strictly avoid infinite loops by not calling renderBoard here
    // But we need to save the state.
    // However, saveState() doesn't call renderBoard(), so it is safe.
    saveState();

    // Render Chart
    const ctx = document.getElementById('burndownChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (burndownChart) {
        burndownChart.destroy();
    }

    // Chart.js Configuration
    burndownChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: board.history.map(h => {
                const date = new Date(h.date);
                return `${date.getDate()}/${date.getMonth() + 1}`;
            }),
            datasets: [{
                label: 'Remaining Hours',
                data: board.history.map(h => h.remaining),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y} hours remaining`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        borderDash: [5, 5]
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // Check dark mode for chart styling
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = '#334155';
    }
};

// Toggle Panel
const burndownPanel = document.getElementById('burndownPanel');
const burndownHeader = document.getElementById('burndownHeader');

if (burndownHeader) {
    burndownHeader.addEventListener('click', () => {
        burndownPanel.classList.toggle('collapsed');
    });
}

// ================================
// CREATE LIST ELEMENT
// ================================
const createListElement = (list) => {
    const board = getCurrentBoard();
    const listEl = document.createElement('div');
    listEl.className = 'list';
    listEl.dataset.listId = list.id;

    const completedCards = list.cards.filter(c => c.checklist.length && c.checklist.every(i => i.completed)).length;

    // Calculate totals for time tracking
    const totalInitialEstimate = list.cards.reduce((sum, card) => sum + (card.initialEstimate || 0), 0);
    const totalRemainingHours = list.cards.reduce((sum, card) => sum + (card.remainingHours || 0), 0);

    listEl.innerHTML = `
        <div class="list-header">
            <input type="text" class="list-title" value="${list.title}">
            <div class="list-badges">
                <span class="list-hour-badge estimate" title="Total Initial Estimate">
                    <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    ${totalInitialEstimate}h
                </span>
                <span class="list-hour-badge remaining" title="Total Remaining Hours">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    ${totalRemainingHours}h
                </span>
                <span class="list-count">${list.cards.length}</span>
            </div>
            <button class="list-menu-btn">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
            </button>
            <div class="list-menu">
                <button class="list-menu-item move-list-left"><svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Move Left</button>
                <button class="list-menu-item move-list-right"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Move Right</button>
                <div class="list-menu-divider"></div>
                <button class="list-menu-item copy-list"><svg viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" stroke-width="2"/></svg>Copy list</button>
                <button class="list-menu-item clear-list"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Clear cards</button>
                <button class="list-menu-item danger delete-list"><svg viewBox="0 0 24 24" fill="none"><path d="M3 6H21M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Delete list</button>
            </div>
        </div>
        <div class="list-cards" data-list-id="${list.id}"></div>
        <div class="list-footer">
            <button class="add-card-btn">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Add a card
            </button>
            <div class="add-card-form">
                <textarea class="add-card-input" placeholder="Enter a title for this card..." rows="2"></textarea>
                <div class="add-card-actions">
                    <button class="btn btn-sm btn-primary add-card-save">Add Card</button>
                    <button class="btn-icon add-card-cancel">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    // List title editing
    const titleInput = listEl.querySelector('.list-title');
    titleInput.addEventListener('blur', () => {
        const newTitle = titleInput.value.trim();
        if (newTitle && newTitle !== list.title) {
            list.title = newTitle;
            saveState();
        } else {
            titleInput.value = list.title;
        }
    });
    titleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') titleInput.blur();
    });

    // List menu
    const menuBtn = listEl.querySelector('.list-menu-btn');
    const menu = listEl.querySelector('.list-menu');

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.list-menu.active').forEach(m => m.classList.remove('active'));
        menu.classList.toggle('active');
    });

    document.addEventListener('click', () => menu.classList.remove('active'));

    // Move list left
    listEl.querySelector('.move-list-left').addEventListener('click', () => {
        const currentIndex = board.lists.indexOf(list);
        if (currentIndex > 0) {
            // Swap with the list on the left
            [board.lists[currentIndex - 1], board.lists[currentIndex]] =
                [board.lists[currentIndex], board.lists[currentIndex - 1]];
            saveState();
            renderBoard();
            showToast('List moved left!', 'success');
        }
    });

    // Move list right
    listEl.querySelector('.move-list-right').addEventListener('click', () => {
        const currentIndex = board.lists.indexOf(list);
        if (currentIndex < board.lists.length - 1) {
            // Swap with the list on the right
            [board.lists[currentIndex], board.lists[currentIndex + 1]] =
                [board.lists[currentIndex + 1], board.lists[currentIndex]];
            saveState();
            renderBoard();
            showToast('List moved right!', 'success');
        }
    });

    listEl.querySelector('.copy-list').addEventListener('click', () => {
        const newList = JSON.parse(JSON.stringify(list));
        newList.id = generateId();
        newList.title = `${list.title} (copy)`;
        newList.cards.forEach(c => c.id = generateId());
        board.lists.splice(board.lists.indexOf(list) + 1, 0, newList);
        saveState();
        renderBoard();
        showToast('List copied!', 'success');
    });

    listEl.querySelector('.clear-list').addEventListener('click', () => {
        list.cards = [];
        saveState();
        renderBoard();
        showToast('Cards cleared!', 'info');
    });

    listEl.querySelector('.delete-list').addEventListener('click', () => {
        board.lists = board.lists.filter(l => l.id !== list.id);
        saveState();
        renderBoard();
        showToast('List deleted!', 'success');
    });

    // Add card
    const addCardBtn = listEl.querySelector('.add-card-btn');
    const addCardForm = listEl.querySelector('.add-card-form');
    const addCardInput = listEl.querySelector('.add-card-input');

    addCardBtn.addEventListener('click', () => {
        addCardBtn.style.display = 'none';
        addCardForm.classList.add('active');
        addCardInput.focus();
    });

    listEl.querySelector('.add-card-cancel').addEventListener('click', () => {
        addCardBtn.style.display = 'flex';
        addCardForm.classList.remove('active');
        addCardInput.value = '';
    });

    listEl.querySelector('.add-card-save').addEventListener('click', () => {
        const title = addCardInput.value.trim();
        if (title) {
            list.cards.push({ id: generateId(), title, description: '', labels: [], dueDate: '', checklist: [], initialEstimate: 0, remainingHours: 0 });
            saveState();
            renderBoard();
            showToast('Card added!', 'success');
        }
    });

    addCardInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            listEl.querySelector('.add-card-save').click();
        }
        if (e.key === 'Escape') listEl.querySelector('.add-card-cancel').click();
    });

    // Render cards
    const cardsContainer = listEl.querySelector('.list-cards');
    list.cards.forEach(card => {
        const cardEl = createCardElement(card, list.id);
        cardsContainer.appendChild(cardEl);
    });

    return listEl;
};

// ================================
// CREATE CARD ELEMENT
// ================================
const createCardElement = (card, listId) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.dataset.cardId = card.id;
    cardEl.draggable = true;

    const labelColors = {
        'priority-high': '#ef4444',
        'priority-medium': '#f59e0b',
        'priority-low': '#22c55e',
        'bug': '#dc2626',
        'feature': '#8b5cf6',
        'improvement': '#06b6d4'
    };

    const labelsHtml = card.labels.length ? `
        <div class="card-labels">
            ${card.labels.map(l => `<div class="card-label" style="background: ${labelColors[l]}"></div>`).join('')}
        </div>
    ` : '';

    let metaHtml = '';
    const hasTimeTracking = (card.initialEstimate && card.initialEstimate > 0) || (card.remainingHours && card.remainingHours > 0);
    if (card.dueDate || card.checklist.length || card.description || hasTimeTracking || card.assigneeId) {
        const dueDateClass = card.dueDate ? (new Date(card.dueDate) < new Date() ? 'overdue' : new Date(card.dueDate) < new Date(Date.now() + 86400000 * 2) ? 'soon' : '') : '';
        metaHtml = `<div class="card-meta">`;
        if (card.dueDate) {
            metaHtml += `<span class="card-meta-item ${dueDateClass}"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>${new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>`;
        }
        if (card.description) {
            metaHtml += `<span class="card-meta-item"><svg viewBox="0 0 24 24" fill="none"><path d="M4 6H20M4 12H20M4 18H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>`;
        }
        if (card.checklist.length) {
            const completed = card.checklist.filter(i => i.completed).length;
            metaHtml += `<span class="card-meta-item ${completed === card.checklist.length ? '' : ''}"><svg viewBox="0 0 24 24" fill="none"><path d="M9 11L12 14L22 4M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>${completed}/${card.checklist.length}</span>`;
        }
        if (hasTimeTracking) {
            const isComplete = card.remainingHours === 0 && card.initialEstimate > 0;
            const badgeClass = isComplete ? 'complete' : (card.remainingHours > 0 ? 'has-remaining' : '');
            metaHtml += `<span class="card-time-badge ${badgeClass}"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>${card.remainingHours || 0}/${card.initialEstimate || 0}h</span>`;
        }

        // Assignee Avatar
        if (card.assigneeId) {
            const board = getCurrentBoard();
            if (board) {
                const assignee = board.members?.find(m => m.id === card.assigneeId) || (board.owner?.id === card.assigneeId ? board.owner : null);
                if (assignee) {
                    const initial = assignee.name ? assignee.name.charAt(0).toUpperCase() : (assignee.email ? assignee.email.charAt(0).toUpperCase() : '?');
                    const avatarContent = assignee.photoURL
                        ? `<img src="${assignee.photoURL}" alt="${assignee.name || 'Assignee'}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover;">`
                        : `<span style="width: 20px; height: 20px; border-radius: 50%; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">${initial}</span>`;

                    metaHtml += `<div class="card-assignee" style="margin-left: auto;" title="Assigned to ${assignee.name || assignee.email}">${avatarContent}</div>`;
                }
            }
        }

        metaHtml += `</div>`;
    }

    cardEl.innerHTML = `
        ${labelsHtml}
        <div class="card-content">
            <div class="card-title-text">${card.title}</div>
            ${metaHtml}
        </div>
    `;

    cardEl.addEventListener('click', () => openCardModal(card.id, listId));

    return cardEl;
};

// ================================
// CARD MODAL
// ================================
const openCardModal = (cardId, listId) => {
    const board = getCurrentBoard();
    const list = board.lists.find(l => l.id === listId);
    const card = list.cards.find(c => c.id === cardId);

    state.editingCard = { cardId, listId };

    document.getElementById('cardTitle').value = card.title;
    document.getElementById('cardDescription').value = card.description;
    document.getElementById('cardDueDate').value = card.dueDate;

    // Time tracking
    document.getElementById('cardInitialEstimate').value = card.initialEstimate || '';
    document.getElementById('cardRemainingHours').value = card.remainingHours || '';

    // Assignee
    const assigneeSelect = document.getElementById('cardAssignee');
    assigneeSelect.innerHTML = '<option value="">Unassigned</option>';

    // Add owner
    if (board.owner) {
        const ownerName = board.owner.name || board.owner.email || 'Owner';
        assigneeSelect.add(new Option(`${ownerName} (Owner)`, board.owner.id));
    }

    // Add members
    if (board.members) {
        board.members.forEach(m => {
            const name = m.name || m.email;
            assigneeSelect.add(new Option(name, m.id));
        });
    }

    assigneeSelect.value = card.assigneeId || '';

    // Labels
    document.querySelectorAll('.label-option').forEach(opt => {
        opt.classList.toggle('selected', card.labels.includes(opt.dataset.label));
    });

    // Checklist
    renderChecklist(card);

    cardModal.classList.add('active');
};

const renderChecklist = (card) => {
    const container = document.getElementById('checklist');
    container.innerHTML = card.checklist.map(item => `
        <div class="checklist-item ${item.completed ? 'completed' : ''}" data-item-id="${item.id}">
            <input type="checkbox" class="checklist-checkbox" ${item.completed ? 'checked' : ''}>
            <span class="checklist-text">${item.text}</span>
            <button class="checklist-delete"><svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
    `).join('');

    container.querySelectorAll('.checklist-item').forEach(itemEl => {
        const itemId = itemEl.dataset.itemId;

        itemEl.querySelector('.checklist-checkbox').addEventListener('change', (e) => {
            const item = card.checklist.find(i => i.id === itemId);
            item.completed = e.target.checked;
            itemEl.classList.toggle('completed', e.target.checked);
        });

        itemEl.querySelector('.checklist-delete').addEventListener('click', () => {
            card.checklist = card.checklist.filter(i => i.id !== itemId);
            renderChecklist(card);
        });
    });
};

document.getElementById('addChecklistItemBtn').addEventListener('click', () => {
    const input = document.getElementById('newChecklistItem');
    const text = input.value.trim();
    if (!text || !state.editingCard) return;

    const board = getCurrentBoard();
    const list = board.lists.find(l => l.id === state.editingCard.listId);
    const card = list.cards.find(c => c.id === state.editingCard.cardId);

    card.checklist.push({ id: generateId(), text, completed: false });
    input.value = '';
    renderChecklist(card);
});

document.getElementById('newChecklistItem').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('addChecklistItemBtn').click();
});

document.querySelectorAll('.label-option').forEach(opt => {
    opt.addEventListener('click', () => opt.classList.toggle('selected'));
});

document.getElementById('closeCardModal').addEventListener('click', () => cardModal.classList.remove('active'));
document.getElementById('cancelCardBtn').addEventListener('click', () => cardModal.classList.remove('active'));

document.getElementById('saveCardBtn').addEventListener('click', () => {
    if (!state.editingCard) return;

    const board = getCurrentBoard();
    const list = board.lists.find(l => l.id === state.editingCard.listId);
    const card = list.cards.find(c => c.id === state.editingCard.cardId);

    card.title = document.getElementById('cardTitle').value.trim() || 'Untitled';
    card.description = document.getElementById('cardDescription').value;
    card.dueDate = document.getElementById('cardDueDate').value;
    card.labels = Array.from(document.querySelectorAll('.label-option.selected')).map(o => o.dataset.label);

    // Time tracking
    card.initialEstimate = parseFloat(document.getElementById('cardInitialEstimate').value) || 0;
    card.remainingHours = parseFloat(document.getElementById('cardRemainingHours').value) || 0;

    // Assignee
    card.assigneeId = document.getElementById('cardAssignee').value;

    saveState();
    renderBoard();
    cardModal.classList.remove('active');
    showToast('Card saved!', 'success');
});

document.getElementById('duplicateCardBtn').addEventListener('click', () => {
    if (!state.editingCard) return;

    const board = getCurrentBoard();
    const list = board.lists.find(l => l.id === state.editingCard.listId);
    const card = list.cards.find(c => c.id === state.editingCard.cardId);

    const newCard = JSON.parse(JSON.stringify(card));
    newCard.id = generateId();
    newCard.title = `${card.title} (copy)`;
    newCard.checklist.forEach(i => i.id = generateId());

    list.cards.splice(list.cards.indexOf(card) + 1, 0, newCard);
    saveState();
    renderBoard();
    cardModal.classList.remove('active');
    showToast('Card duplicated!', 'success');
});

document.getElementById('deleteCardBtn').addEventListener('click', () => {
    if (!state.editingCard) return;

    const board = getCurrentBoard();
    const list = board.lists.find(l => l.id === state.editingCard.listId);
    list.cards = list.cards.filter(c => c.id !== state.editingCard.cardId);

    saveState();
    renderBoard();
    cardModal.classList.remove('active');
    showToast('Card deleted!', 'success');
});

// ================================
// DRAG AND DROP
// ================================
let draggedCard = null;
let draggedList = null;

const initDragAndDrop = () => {
    // Card drag and drop
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('dragstart', handleCardDragStart);
        card.addEventListener('dragend', handleCardDragEnd);
    });

    document.querySelectorAll('.list-cards').forEach(container => {
        container.addEventListener('dragover', handleCardDragOver);
        container.addEventListener('drop', handleCardDrop);
        container.addEventListener('dragleave', handleCardDragLeave);
    });
};

const handleCardDragStart = (e) => {
    const cardEl = e.target.closest('.card');
    if (!cardEl) return;
    draggedCard = cardEl;
    cardEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardEl.dataset.cardId);
};

const handleCardDragEnd = (e) => {
    const cardEl = e.target.closest('.card');
    if (cardEl) cardEl.classList.remove('dragging');
    document.querySelectorAll('.card-placeholder').forEach(p => p.remove());
    draggedCard = null;
};

const handleCardDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const container = e.currentTarget;
    const afterElement = getDragAfterElement(container, e.clientY);

    // Remove existing placeholders
    document.querySelectorAll('.card-placeholder').forEach(p => p.remove());

    const placeholder = document.createElement('div');
    placeholder.className = 'card-placeholder';

    if (afterElement) {
        container.insertBefore(placeholder, afterElement);
    } else {
        container.appendChild(placeholder);
    }
};

const handleCardDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
        e.currentTarget.querySelectorAll('.card-placeholder').forEach(p => p.remove());
    }
};

const handleCardDrop = (e) => {
    e.preventDefault();

    // Safety check - ensure we have a valid dragged card
    if (!draggedCard) return;

    const targetListId = e.currentTarget.dataset.listId;
    const cardId = draggedCard.dataset.cardId;
    const sourceListEl = draggedCard.closest('.list');

    // Safety check - ensure we can find source list
    if (!sourceListEl || !cardId) return;

    const sourceListId = sourceListEl.dataset.listId;

    const board = getCurrentBoard();
    const sourceList = board.lists.find(l => l.id === sourceListId);
    const targetList = board.lists.find(l => l.id === targetListId);

    // Safety check - ensure lists exist
    if (!sourceList || !targetList) return;

    const cardIndex = sourceList.cards.findIndex(c => c.id === cardId);

    // Safety check - ensure card was found
    if (cardIndex === -1) return;

    const [card] = sourceList.cards.splice(cardIndex, 1);

    const afterElement = getDragAfterElement(e.currentTarget, e.clientY);
    let insertIndex;

    if (afterElement) {
        const afterCardId = afterElement.dataset.cardId;
        insertIndex = targetList.cards.findIndex(c => c.id === afterCardId);
        // If afterElement's card not found (shouldn't happen), append to end
        if (insertIndex === -1) insertIndex = targetList.cards.length;
    } else {
        insertIndex = targetList.cards.length;
    }

    targetList.cards.splice(insertIndex, 0, card);

    document.querySelectorAll('.card-placeholder').forEach(p => p.remove());
    saveState();
    renderBoard();
};

const getDragAfterElement = (container, y) => {
    const elements = [...container.querySelectorAll('.card:not(.dragging)')];

    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
};

// ================================
// PROJECT INFO MODAL
// ================================
const projectInfoModal = document.getElementById('projectInfoModal');
const projectInfoBtn = document.getElementById('projectInfoBtn');

// Open Project Info Modal
projectInfoBtn.addEventListener('click', () => {
    openProjectInfoModal();
});

// Close Project Info Modal
document.getElementById('closeProjectInfoModal').addEventListener('click', () => {
    projectInfoModal.classList.remove('active');
});

document.getElementById('closeProjectInfoBtn').addEventListener('click', () => {
    projectInfoModal.classList.remove('active');
});

projectInfoModal.addEventListener('click', (e) => {
    if (e.target === projectInfoModal) projectInfoModal.classList.remove('active');
});

// Open and render Project Info Modal
const openProjectInfoModal = () => {
    const board = getCurrentBoard();
    if (!board) return;

    // Update project details
    document.getElementById('projectColorPreview').style.background = board.background;
    document.getElementById('projectName').textContent = board.name;

    // Calculate stats
    const listCount = board.lists?.length || 0;
    const cardCount = board.lists?.reduce((sum, list) => sum + (list.cards?.length || 0), 0) || 0;
    document.getElementById('projectStats').textContent = `${listCount} list${listCount !== 1 ? 's' : ''} • ${cardCount} card${cardCount !== 1 ? 's' : ''}`;

    // Update owner info
    const owner = board.owner || { name: currentUser?.displayName || 'You', email: currentUser?.email || 'you@example.com', photoURL: currentUser?.photoURL };
    const ownerAvatarEl = document.getElementById('projectOwnerAvatar');
    const ownerNameEl = document.getElementById('projectOwnerName');

    if (owner.photoURL) {
        ownerAvatarEl.innerHTML = `<img src="${owner.photoURL}" alt="${owner.name}">`;
    } else {
        ownerAvatarEl.innerHTML = owner.name.charAt(0).toUpperCase();
    }
    ownerNameEl.textContent = owner.name;

    // Render team members
    renderTeamMembers();

    // Update invite link
    updateInviteLinkInput();

    projectInfoModal.classList.add('active');
};

// Render Team Members List
const renderTeamMembers = () => {
    const board = getCurrentBoard();
    if (!board) return;

    const members = board.members || [];
    const teamMembersList = document.getElementById('teamMembersList');
    const teamCount = document.getElementById('teamCount');

    teamCount.textContent = members.length;

    if (members.length === 0) {
        teamMembersList.innerHTML = `
            <div class="team-empty-state">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>No team members yet. Invite someone to collaborate!</p>
            </div>
        `;
        return;
    }

    teamMembersList.innerHTML = members.map(member => {
        const initial = member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase();
        const avatarContent = member.photoURL
            ? `<img src="${member.photoURL}" alt="${member.name || member.email}">`
            : initial;
        const roleClass = member.role === 'pending' ? 'pending' : '';
        const roleText = member.role === 'pending' ? 'Pending' : 'Member';

        return `
            <div class="team-member-item" data-member-id="${member.id}">
                <div class="member-avatar">${avatarContent}</div>
                <div class="member-info">
                    <div class="member-name">${member.name || 'Invited User'}</div>
                    <div class="member-email">${member.email}</div>
                </div>
                <span class="member-role ${roleClass}">${roleText}</span>
                <div class="member-actions">
                    <button class="member-action-btn danger remove-member-btn" title="Remove member" data-member-id="${member.id}">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners for remove buttons
    teamMembersList.querySelectorAll('.remove-member-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const memberId = btn.dataset.memberId;
            removeMember(memberId);
        });
    });
};

// ================================
// INVITE LINK FUNCTIONALITY
// ================================

// Generate a unique invite token
const generateInviteToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get or create invite token for current board
const getOrCreateInviteToken = () => {
    const board = getCurrentBoard();
    if (!board) return null;

    if (!board.inviteToken) {
        board.inviteToken = generateInviteToken();
        saveState();
    }

    return board.inviteToken;
};

// Generate invite link
const generateInviteLink = () => {
    const board = getCurrentBoard();
    if (!board) return '';

    const token = getOrCreateInviteToken();
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?invite=${token}&board=${board.id}`;
};

// Update invite link input
const updateInviteLinkInput = () => {
    const inviteLinkInput = document.getElementById('inviteLinkInput');
    if (inviteLinkInput) {
        inviteLinkInput.value = generateInviteLink();
    }
};

// Copy invite link to clipboard
document.getElementById('copyInviteLinkBtn').addEventListener('click', async () => {
    const inviteLinkInput = document.getElementById('inviteLinkInput');
    const copyBtn = document.getElementById('copyInviteLinkBtn');
    const copyIcon = document.getElementById('copyIcon');
    const checkIcon = document.getElementById('checkIcon');
    const copyBtnText = document.getElementById('copyBtnText');

    try {
        await navigator.clipboard.writeText(inviteLinkInput.value);

        // Visual feedback
        copyBtn.classList.add('copied');
        copyIcon.classList.add('hidden');
        checkIcon.classList.remove('hidden');
        copyBtnText.textContent = 'Copied!';

        showToast('Invite link copied to clipboard!', 'success');

        // Reset after 2 seconds
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
            copyBtnText.textContent = 'Copy';
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        inviteLinkInput.select();
        document.execCommand('copy');
        showToast('Invite link copied to clipboard!', 'success');
    }
});

// Regenerate invite link
document.getElementById('regenerateLinkBtn').addEventListener('click', () => {
    const board = getCurrentBoard();
    if (!board) return;

    if (confirm('Generate a new invite link? The old link will no longer work.')) {
        board.inviteToken = generateInviteToken();
        saveState();
        updateInviteLinkInput();
        showToast('New invite link generated!', 'success');
    }
});

// Handle joining via invite link
const handleInviteLink = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    const boardId = urlParams.get('board');

    if (!inviteToken || !boardId) return;

    try {
        // Fetch board directly from Firestore
        const doc = await db.collection('boards').doc(boardId).get();
        if (!doc.exists) {
            showToast('Board not found', 'error');
            return;
        }

        const board = doc.data();

        // Verify token
        if (board.inviteToken !== inviteToken) {
            showToast('Invalid or expired invite link', 'error');
            return;
        }

        // Check if user is already a member
        const userEmail = currentUser?.email || '';
        const isOwner = board.owner?.email === userEmail;
        const isMember = board.members?.some(m => m.email === userEmail);

        if (!isOwner && !isMember && currentUser) {
            // Add user as a member
            if (!board.members) board.members = [];

            board.members.push({
                id: generateId(),
                name: currentUser.displayName || '',
                email: currentUser.email,
                photoURL: currentUser.photoURL || null,
                role: 'member',
                addedAt: new Date().toISOString()
            });

            // Update memberEmails for querying
            board.memberEmails = [
                board.owner?.email,
                ...(board.members || []).map(m => m.email)
            ].filter(Boolean);

            // Update board in Firestore
            await db.collection('boards').doc(board.id).set(board, { merge: true });

            showToast(`You've joined "${board.name}"!`, 'success');

            // Reload clean state
            await loadState();

            // Force switch to the new board
            state.currentBoardId = boardId;

            // Save preference so it sticks
            await db.collection('users').doc(currentUser.uid).set({
                currentBoardId: state.currentBoardId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            renderBoard();
        } else if (isOwner || isMember) {
            // Already member, just switch to it
            state.currentBoardId = boardId;
            // Save preference
            await db.collection('users').doc(currentUser.uid).set({
                currentBoardId: state.currentBoardId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            renderBoard();
            showToast('Welcome back to the board!', 'success');
        }

    } catch (error) {
        console.error('Error joining board:', error);
        showToast('Error joining board', 'error');
    }

    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
};

// Remove Member
const removeMember = (memberId) => {
    const board = getCurrentBoard();
    if (!board || !board.members) return;

    const member = board.members.find(m => m.id === memberId);
    if (!member) return;

    // Confirm removal
    if (!confirm(`Are you sure you want to remove ${member.name || member.email} from the team?`)) {
        return;
    }

    board.members = board.members.filter(m => m.id !== memberId);
    saveState();
    renderTeamMembers();

    showToast(`${member.name || member.email} has been removed from the team`, 'info');
};

// ================================
// INITIALIZE APP
// ================================
initAuth();

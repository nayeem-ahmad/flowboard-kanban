// FlowBoard - Trello-like Kanban Board Application with Firebase
// =============================================================

// ================================
// FIREBASE CONFIGURATION
// ================================
// Firebase configuration for FlowBoard (using ai-readiness-checker project)
const firebaseConfig = {
    apiKey: "AIzaSyBdELEner5sCFYtjGfFsdcC-KuPazi274k",
    authDomain: "ai-readiness-checker.firebaseapp.com",
    projectId: "ai-readiness-checker",
    storageBucket: "ai-readiness-checker.firebasestorage.app",
    messagingSenderId: "409159590979",
    appId: "1:409159590979:web:240e5c9aa1ca66df0c20f6",
    measurementId: "G-7VNRTPS9NT"
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
        lists: [
            {
                id: generateId(),
                title: 'To Do',
                cards: [
                    { id: generateId(), title: 'Research competitor products', description: 'Analyze top 5 competitors', labels: ['priority-high'], dueDate: '2026-01-10', checklist: [{ id: generateId(), text: 'Find competitors', completed: true }, { id: generateId(), text: 'Analyze features', completed: false }] },
                    { id: generateId(), title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity designs', labels: ['feature'], dueDate: '', checklist: [] },
                    { id: generateId(), title: 'Set up development environment', description: '', labels: ['improvement'], dueDate: '2026-01-08', checklist: [] }
                ]
            },
            {
                id: generateId(),
                title: 'In Progress',
                cards: [
                    { id: generateId(), title: 'Implement user authentication', description: 'OAuth2 and email/password login', labels: ['feature', 'priority-medium'], dueDate: '2026-01-15', checklist: [{ id: generateId(), text: 'Set up OAuth', completed: true }, { id: generateId(), text: 'Email verification', completed: false }] },
                    { id: generateId(), title: 'Create database schema', description: 'PostgreSQL with proper indexing', labels: ['priority-high'], dueDate: '', checklist: [] }
                ]
            },
            {
                id: generateId(),
                title: 'Review',
                cards: [
                    { id: generateId(), title: 'API documentation', description: 'Swagger/OpenAPI specs', labels: ['improvement'], dueDate: '2026-01-07', checklist: [] }
                ]
            },
            {
                id: generateId(),
                title: 'Done',
                cards: [
                    { id: generateId(), title: 'Project setup', description: 'Initial configuration complete', labels: ['priority-low'], dueDate: '', checklist: [] },
                    { id: generateId(), title: 'Team kickoff meeting', description: 'Introductions and project overview', labels: [], dueDate: '', checklist: [] }
                ]
            }
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
            await db.collection('users').doc(currentUser.uid).set({
                boards: state.boards,
                currentBoardId: state.currentBoardId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
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
            const doc = await db.collection('users').doc(currentUser.uid).get();
            if (doc.exists) {
                const data = doc.data();
                state.boards = data.boards || [];
                state.currentBoardId = data.currentBoardId;
                if (!state.boards.length) initializeSampleData();
                return;
            }
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
    if (isFirebaseConfigured) {
        auth.onAuthStateChanged(async (user) => {
            currentUser = user;

            if (user) {
                // User is signed in
                updateUserUI(user);

                // Load user's data
                await loadState();

                // Show main app, hide auth
                loadingScreen.classList.add('hidden');
                authScreen.classList.add('hidden');
                headerElement.classList.remove('hidden');
                boardContainer.classList.remove('hidden');

                // Initialize theme and render
                initTheme();
                renderBoard();
            } else {
                // User is signed out
                loadingScreen.classList.add('hidden');
                authScreen.classList.remove('hidden');
                headerElement.classList.add('hidden');
                boardContainer.classList.add('hidden');
            }
        });
    } else {
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
    if (!board) return;

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
};

// ================================
// CREATE LIST ELEMENT
// ================================
const createListElement = (list) => {
    const board = getCurrentBoard();
    const listEl = document.createElement('div');
    listEl.className = 'list';
    listEl.dataset.listId = list.id;

    const completedCards = list.cards.filter(c => c.checklist.length && c.checklist.every(i => i.completed)).length;

    listEl.innerHTML = `
        <div class="list-header">
            <input type="text" class="list-title" value="${list.title}">
            <span class="list-count">${list.cards.length}</span>
            <button class="list-menu-btn">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
            </button>
            <div class="list-menu">
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
            list.cards.push({ id: generateId(), title, description: '', labels: [], dueDate: '', checklist: [] });
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
    if (card.dueDate || card.checklist.length || card.description) {
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
// INITIALIZE APP
// ================================
initAuth();

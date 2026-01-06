import { initAuth } from './auth.js';
import { renderBoard } from './board.js';
import { state, saveState, getOrCreateInviteToken, generateInviteToken, getCurrentBoard } from './store.js';
import { showToast, generateUniqueProjectName } from './utils.js';
import './project.js'; // Import project logic/listeners

console.log('App initialization...');

// Initialize Auth
initAuth();

// ================================
// EVENT LISTENERS
// ================================

// Project Selector
document.getElementById('projectSelectorBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('projectSelector').classList.toggle('active');
    document.getElementById('boardSelector').classList.remove('active');
    renderHeaderProjectList();
});

document.getElementById('boardSelectorBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('boardSelector').classList.toggle('active');
    document.getElementById('projectSelector').classList.remove('active');
    renderHeaderBoardList();
});

document.addEventListener('click', (e) => {
    const ps = document.getElementById('projectSelector');
    const bs = document.getElementById('boardSelector');
    if (ps && !ps.contains(e.target)) ps.classList.remove('active');
    if (bs && !bs.contains(e.target)) bs.classList.remove('active');
});

const renderHeaderProjectList = () => {
    const list = document.getElementById('projectList');
    if (!list) return;
    list.innerHTML = state.projects.map(p => `
        <button class="board-list-item ${p.id === state.currentProjectId ? 'active' : ''}" data-id="${p.id}">
            <div class="board-color-dot" style="background: var(--accent-primary)"></div>
            <span class="board-item-name">${p.name}</span>
        </button>
    `).join('');

    list.querySelectorAll('.board-list-item').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.id !== state.currentProjectId) {
                state.currentProjectId = btn.dataset.id;
                // Switch to first board of project
                const boards = state.boards.filter(b => b.projectId === state.currentProjectId);
                state.currentBoardId = boards.length ? boards[0].id : null;
                saveState();
                renderBoard();
            }
            document.getElementById('projectSelector').classList.remove('active');
        });
    });
};

const renderHeaderBoardList = () => {
    const list = document.getElementById('boardList');
    if (!list) return;
    const boards = state.boards.filter(b => b.projectId === state.currentProjectId);

    if (!boards.length) {
        list.innerHTML = '<div style="padding:1rem">No boards</div>';
        return;
    }

    list.innerHTML = boards.map(b => `
        <button class="board-list-item ${b.id === state.currentBoardId ? 'active' : ''}" data-id="${b.id}">
             <div class="board-color-dot" style="background: ${b.background}"></div>
             <span class="board-item-name">${b.name}</span>
        </button>
    `).join('');

    list.querySelectorAll('.board-list-item').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentBoardId = btn.dataset.id;
            saveState();
            renderBoard();
            document.getElementById('boardSelector').classList.remove('active');
        });
    });
};

// Theme Toggle
export const initTheme = () => {
    const saved = localStorage.getItem('flowboard-theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
};

document.getElementById('themeToggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('flowboard-theme', isDark ? 'light' : 'dark');
});

// Modal Events (Custom Events)
window.addEventListener('openCardModal', (e) => {
    const { cardId, listId } = e.detail;
    // Logic to open card modal (omitted for brevity, would be in modals.js or here)
    // For now, let's just log
    console.log('Open card modal', cardId);
    document.getElementById('cardModal').classList.add('active');
    // ... populate fields ...
});

window.addEventListener('newUserNoBoards', () => {
    const modal = document.getElementById('boardModal');
    if (modal) {
        modal.classList.add('active');
        const input = document.getElementById('boardName');
        if (input) input.value = generateUniqueProjectName();
    }
});

// Board Creation
document.getElementById('createBoardBtn')?.addEventListener('click', () => {
    document.getElementById('boardModal').classList.add('active');
    document.getElementById('boardSelector').classList.remove('active');
});

// Close modals
document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
        if (e.target === el) {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        }
    });
});

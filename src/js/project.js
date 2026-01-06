import { state, getCurrentBoard, saveState, getCurrentUser, getOrCreateInviteToken, generateInviteToken } from './store.js';
import { generateId, showToast } from './utils.js';
import { renderBoard } from './board.js';
import { db, isFirebaseConfigured } from './config.js';

// ================================
// INVITE LOGIC
// ================================
export const handleInviteLink = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    const boardId = urlParams.get('board');

    if (!inviteToken || !boardId) return;

    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        const doc = await db.collection('boards').doc(boardId).get();
        if (!doc.exists) {
            showToast('Board not found', 'error');
            return;
        }

        const board = doc.data();
        if (board.inviteToken !== inviteToken) {
            showToast('Invalid or expired invite link', 'error');
            return;
        }

        let joinedAny = false;
        const addUserToEntity = (entity) => {
            const userEmail = currentUser.email;
            if (entity.owner?.email === userEmail) return false;
            if (entity.members?.some(m => m.email === userEmail)) return false;

            if (!entity.members) entity.members = [];
            entity.members.push({
                id: generateId(),
                name: currentUser.displayName || '',
                email: currentUser.email,
                photoURL: currentUser.photoURL || null,
                role: 'member',
                addedAt: new Date().toISOString()
            });
            entity.memberEmails = [entity.owner?.email, ...(entity.members.map(m => m.email))].filter(Boolean);
            return true;
        };

        if (addUserToEntity(board)) {
            await db.collection('boards').doc(board.id).set(board, { merge: true });
            joinedAny = true;
        }

        if (board.projectId) {
            const pDoc = await db.collection('projects').doc(board.projectId).get();
            if (pDoc.exists) {
                const project = pDoc.data();
                if (addUserToEntity(project)) {
                    await db.collection('projects').doc(project.id).set(project, { merge: true });
                    joinedAny = true;
                }
                // Join other boards
                const boardsSnap = await db.collection('boards').where('projectId', '==', board.projectId).get();
                const batch = db.batch();
                boardsSnap.forEach(bDoc => {
                    if (bDoc.id === board.id) return;
                    const bData = bDoc.data();
                    if (addUserToEntity(bData)) batch.set(bDoc.ref, bData, { merge: true });
                });
                await batch.commit();
            }
        }

        if (joinedAny) {
            showToast('Joined successfully!', 'success');
            state.currentBoardId = boardId;
            if (board.projectId) state.currentProjectId = board.projectId;
            // Reload state? Simplest is to force reload or re-query.
            // But we are in module. app.js will render after auth.
            // If already loaded, we might need to refresh.
            // For now assume reloadState is handled or user manual refresh.
            // Actually loadState should be called.
            // import loadState? circular dep likely.
        }

        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
        console.error('Error joining:', error);
    }
};

window.addEventListener('checkInviteLink', handleInviteLink);

// ================================
// PROJECT INFO MODAL
// ================================
const projectInfoModal = document.getElementById('projectInfoModal');

export const openProjectInfoModal = () => {
    const board = getCurrentBoard();
    if (!board || !projectInfoModal) return;

    document.getElementById('projectColorPreview').style.background = board.background;
    document.getElementById('projectName').textContent = board.name;

    const listCount = board.lists?.length || 0;
    const cardCount = board.lists?.reduce((sum, list) => sum + (list.cards?.length || 0), 0) || 0;
    document.getElementById('projectStats').textContent = `${listCount} list${listCount !== 1 ? 's' : ''} • ${cardCount} card${cardCount !== 1 ? 's' : ''}`;

    const owner = board.owner || { name: 'You', email: 'you@example.com' };
    const ownerAvatarEl = document.getElementById('projectOwnerAvatar');
    const ownerNameEl = document.getElementById('projectOwnerName');

    if (owner.photoURL) {
        ownerAvatarEl.innerHTML = `<img src="${owner.photoURL}" alt="${owner.name}">`;
    } else {
        ownerAvatarEl.innerHTML = (owner.name || 'U').charAt(0).toUpperCase();
    }
    ownerNameEl.textContent = owner.name;

    renderTeamMembers();
    updateInviteLinkInput();
    projectInfoModal.classList.add('active');
};

const renderTeamMembers = () => {
    const board = getCurrentBoard();
    if (!board) return;

    const members = board.members || [];
    const list = document.getElementById('teamMembersList');
    const count = document.getElementById('teamCount');
    if (count) count.textContent = members.length;

    if (members.length === 0) {
        list.innerHTML = '<div class="team-empty-state"><p>No team members yet.</p></div>';
        return;
    }

    list.innerHTML = members.map(m => `
        <div class="team-member-item" data-id="${m.id}">
             <div class="member-avatar">${m.photoURL ? `<img src="${m.photoURL}">` : (m.name?.[0] || 'U')}</div>
             <div class="member-info">
                 <div class="member-name">${m.name || 'User'}</div>
                 <div class="member-email">${m.email}</div>
             </div>
             <button class="member-action-btn danger remove-member-btn" data-id="${m.id}">
                 <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
             </button>
        </div>
    `).join('');

    list.querySelectorAll('.remove-member-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mid = btn.dataset.id;
            if (confirm('Remove member?')) {
                board.members = board.members.filter(m => m.id !== mid);
                saveState();
                renderTeamMembers();
            }
        });
    });
};

const updateInviteLinkInput = () => {
    const board = getCurrentBoard();
    if (!board) return;
    const token = getOrCreateInviteToken();
    const input = document.getElementById('inviteLinkInput');
    if (input && token) {
        input.value = `${window.location.origin}${window.location.pathname}?invite=${token}&board=${board.id}`;
    }
};

// Listeners for Project Info Modal
document.getElementById('projectInfoBtn')?.addEventListener('click', openProjectInfoModal);
document.getElementById('closeProjectInfoModal')?.addEventListener('click', () => projectInfoModal.classList.remove('active'));
document.getElementById('closeProjectInfoBtn')?.addEventListener('click', () => projectInfoModal.classList.remove('active'));

document.getElementById('copyInviteLinkBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('inviteLinkInput');
    try {
        await navigator.clipboard.writeText(input.value);
        showToast('Copied!', 'success');
    } catch (e) {
        input.select();
        document.execCommand('copy');
        showToast('Copied!', 'success');
    }
});

document.getElementById('regenerateLinkBtn')?.addEventListener('click', () => {
    const board = getCurrentBoard();
    if (board && confirm('Regenerate link? Old one will fail.')) {
        board.inviteToken = generateInviteToken();
        saveState();
        updateInviteLinkInput();
        showToast('New link generated', 'success');
    }
});


// ================================
// PROJECT MANAGEMENT SCREEN
// ================================
const projectManagementScreen = document.getElementById('projectManagementScreen');
const boardContainer = document.getElementById('boardContainer');
const manageProjectsBtn = document.getElementById('manageProjectsBtn');

if (manageProjectsBtn) {
    manageProjectsBtn.addEventListener('click', () => {
        const isHidden = projectManagementScreen.classList.contains('hidden');
        if (isHidden) {
            projectManagementScreen.classList.remove('hidden');
            boardContainer.classList.add('hidden');
            manageProjectsBtn.classList.add('active');
            const bp = document.getElementById('burndownPanel');
            if (bp) bp.style.display = 'none';
            renderProjectManagement();
        } else {
            projectManagementScreen.classList.add('hidden');
            boardContainer.classList.remove('hidden');
            manageProjectsBtn.classList.remove('active');
            const bp = document.getElementById('burndownPanel');
            if (bp) bp.style.display = '';
        }
    });
}

export const renderProjectManagement = () => {
    const listEl = document.getElementById('pmProjectList');
    if (!listEl) return;

    listEl.innerHTML = state.projects.map(p => `
        <li class="pm-project-item ${p.id === state.currentProjectId ? 'active' : ''}" data-id="${p.id}">
            <span class="project-name">${p.name}</span>
        </li>
    `).join('');

    listEl.querySelectorAll('.pm-project-item').forEach(item => {
        item.addEventListener('click', () => {
            state.currentProjectId = item.dataset.id;
            saveState();
            renderProjectManagement();
            renderProjectDetails();
        });
    });

    if (state.currentProjectId) renderProjectDetails();
};

const renderProjectDetails = () => {
    const project = state.projects.find(p => p.id === state.currentProjectId);
    if (!project) return;

    document.getElementById('pmNoProjectSelected').classList.add('hidden');
    document.getElementById('pmProjectDetails').classList.remove('hidden');
    document.getElementById('pmProjectName').textContent = project.name;

    // Tabs
    const activeTab = document.querySelector('.pm-tab.active')?.dataset.tab || 'sprints'; // Default to sprints? Or 'backlog'?
    renderProjectTab(activeTab);
};

// Tabs
document.querySelectorAll('.pm-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.pm-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.pm-tab-pane').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const tabName = tab.dataset.tab;

        const pane = document.getElementById(`pmTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
        if (pane) pane.classList.add('active');

        renderProjectTab(tabName);
    });
});

const renderProjectTab = (tabName) => {
    const project = state.projects.find(p => p.id === state.currentProjectId);
    if (!project) return;

    if (tabName === 'sprints') renderSprints(project);
    else if (tabName === 'backlog') renderBacklog(project);
    else if (tabName === 'team') renderTeam(project);
};

const renderSprints = (project) => {
    const listEl = document.getElementById('pmSprintList');
    const sprints = state.boards.filter(b => b.projectId === project.id);

    listEl.innerHTML = sprints.map(s => `
        <div class="pm-sprint-item" data-id="${s.id}">
             <div class="pm-sprint-title">${s.name}</div>
             <div class="pm-sprint-stats">${s.lists.reduce((acc, l) => acc + l.cards.length, 0)} cards</div>
        </div>
    `).join('');

    listEl.querySelectorAll('.pm-sprint-item').forEach(el => {
        el.addEventListener('click', () => {
            state.currentBoardId = el.dataset.id;
            saveState();
            renderBoard();
            projectManagementScreen.classList.add('hidden');
            boardContainer.classList.remove('hidden');
            manageProjectsBtn.classList.remove('active');
            const bp = document.getElementById('burndownPanel');
            if (bp) bp.style.display = '';
        });
    });
};

const renderBacklog = (project) => {
    const listEl = document.getElementById('backlogList');
    listEl.innerHTML = (project.backlog || []).map(task => `
        <div class="backlog-item">
             <span>${task.title}</span>
             <button class="btn-icon" data-id="${task.id}" title="Move to Sprint">
                 <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"/></svg>
             </button>
        </div>
    `).join('');

    // Add logic to move to sprint...
    listEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = btn.dataset.id;
            const taskIdx = project.backlog.findIndex(t => t.id === taskId);
            if (taskIdx > -1) {
                const task = project.backlog[taskIdx];
                // Move to first sprint/board
                const sprints = state.boards.filter(b => b.projectId === project.id);
                if (sprints.length) {
                    const target = sprints[0];
                    if (!target.lists.length) target.lists.push({ id: generateId(), title: 'To Do', cards: [] });
                    target.lists[0].cards.push({
                        id: generateId(),
                        title: task.title,
                        labels: [],
                        checklist: []
                        // ... defaults
                    });
                    project.backlog.splice(taskIdx, 1);
                    saveState();
                    renderBacklog(project);
                    showToast(`Moved to ${target.name}`, 'success');
                } else {
                    showToast('No sprints found', 'warning');
                }
            }
        });
    });
};

// Add to Backlog Btn
document.getElementById('addToBacklogBtn')?.addEventListener('click', () => {
    const input = document.getElementById('backlogInput');
    const val = input.value.trim();
    if (val && state.currentProjectId) {
        const project = state.projects.find(p => p.id === state.currentProjectId);
        if (!project.backlog) project.backlog = [];
        project.backlog.push({ id: generateId(), title: val, addedAt: new Date().toISOString() });
        saveState();
        renderBacklog(project);
        input.value = '';
    }
});

const renderTeam = (project) => {
    const listEl = document.getElementById('pmTeamList');
    listEl.innerHTML = (project.members || []).map(m => `
        <div class="pm-team-member">
             <div class="pm-team-info">
                 <div class="user-avatar">${m.name?.[0] || 'U'}</div>
                 <div>
                     <div>${m.name || 'User'}</div>
                     <div style="font-size:0.8rem">${m.email}</div>
                 </div>
             </div>
             <button class="btn-icon danger" data-id="${m.id}">Rm</button>
        </div>
    `).join('');

    listEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove logic...
            if (confirm('Remove member from project?')) {
                project.members = project.members.filter(m => m.id !== btn.dataset.id);
                saveState();
                renderTeam(project);
            }
        });
    });
};

// Add Project Member Btn
document.getElementById('pmAddMemberBtn')?.addEventListener('click', () => {
    const email = prompt('Enter email:');
    if (email && state.currentProjectId) {
        const project = state.projects.find(p => p.id === state.currentProjectId);
        if (!project.members) project.members = [];
        project.members.push({
            id: generateId(),
            email,
            name: email.split('@')[0],
            role: 'member'
        });
        saveState();
        renderTeam(project);
    }
});

// Add Project Btn
document.getElementById('addProjectBtn')?.addEventListener('click', () => {
    const name = prompt('Project Name:');
    if (name) {
        state.projects.push({
            id: generateId(),
            name,
            members: [],
            sprintIds: [],
            backlog: []
        });
        saveState();
        renderProjectManagement();
    }
});

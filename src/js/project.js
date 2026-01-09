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

    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // Store invite details to process after login
        sessionStorage.setItem('pendingInvite', JSON.stringify({ inviteToken, boardId }));
        showToast('Please sign in to join the project', 'info');
        // Optionally open auth modal if available, or rely on user to sign in
        return;
    }

    try {
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
    
    // Project Name and Description Editing
    const nameEl = document.getElementById('pmProjectName');
    const descContainer = document.getElementById('pmProjectDescription'); // Ensure this element exists in HTML or create it dynamically
    // If not in HTML, let's inject it or assume we need to add it to the structure.
    // Looking at index.html, we only have pmProjectName. Let's make the edit button toggle a form.
    
    // Re-render header to include description input
    const headerEl = document.querySelector('.pm-header .pm-title-section');
    headerEl.innerHTML = `
        <div class="project-edit-group">
            <input type="text" id="editProjectName" value="${project.name}" class="form-input project-name-input" />
            <textarea id="editProjectDesc" class="form-input project-desc-input" placeholder="Project Description" rows="2">${project.description || ''}</textarea>
        </div>
        <button class="btn btn-primary" id="saveProjectDetailsBtn">Save</button>
    `;

    // Save Listener
    document.getElementById('saveProjectDetailsBtn').addEventListener('click', () => {
        const newName = document.getElementById('editProjectName').value.trim();
        const newDesc = document.getElementById('editProjectDesc').value.trim();
        
        if (newName) {
            project.name = newName;
            project.description = newDesc;
            saveState();
            renderProjectManagement(); // Update list
            showToast('Project details updated', 'success');
        } else {
            showToast('Project name cannot be empty', 'error');
        }
    });

    // Tabs
    const activeTab = document.querySelector('.pm-tab.active')?.dataset.tab || 'sprints'; 
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
    else if (tabName === 'labels') renderLabels(project);
};

// ================================
// LABEL MANAGEMENT
// ================================
const renderLabels = (project) => {
    const listEl = document.getElementById('pmLabelsList');
    if (!listEl) return;

    listEl.innerHTML = `
        <div class="label-input-container">
            <input type="text" id="newLabelName" placeholder="Label name" class="form-input">
            <input type="color" id="newLabelColor" value="#cccccc" class="form-input-color">
            <button class="btn btn-primary" id="addNewLabelBtn">Add</button>
        </div>
        <div class="label-list">
            ${(project.labels || []).map(label => `
                <div class="label-item" data-id="${label.id}">
                    <span class="label-color-preview" style="background-color: ${label.color};"></span>
                    <span class="label-name">${label.name}</span>
                    <button class="btn-icon edit-label-btn" data-id="${label.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon danger delete-label-btn" data-id="${label.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `).join('')}
        </div>
    `;

    // Add Label
    document.getElementById('addNewLabelBtn')?.addEventListener('click', () => {
        const nameInput = document.getElementById('newLabelName');
        const colorInput = document.getElementById('newLabelColor');
        const name = nameInput.value.trim();
        const color = colorInput.value;

        if (name && color) {
            project.labels.push({ id: generateId(), name, color, description: '' });
            saveState();
            renderLabels(project);
            nameInput.value = '';
            showToast('Label added!', 'success');
        } else {
            showToast('Label name and color cannot be empty.', 'error');
        }
    });

    // Edit/Delete Label
    listEl.querySelectorAll('.edit-label-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const labelId = btn.dataset.id;
            const label = project.labels.find(l => l.id === labelId);
            if (label) {
                const newName = prompt('Edit label name:', label.name);
                if (newName !== null && newName.trim() !== '') {
                    const newColor = prompt('Edit label color (hex or name):', label.color);
                    if (newColor !== null && newColor.trim() !== '') {
                        label.name = newName.trim();
                        label.color = newColor.trim();
                        saveState();
                        renderLabels(project);
                        showToast('Label updated!', 'success');
                    }
                }
            }
        });
    });

    listEl.querySelectorAll('.delete-label-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const labelId = btn.dataset.id;
            if (confirm('Are you sure you want to delete this label?')) {
                project.labels = project.labels.filter(l => l.id !== labelId);
                saveState();
                renderLabels(project);
                showToast('Label deleted!', 'success');
            }
        });
    });
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

    // Switch to Sprint
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

    // Create Sprint Logic
    document.getElementById('pmCreateSprintBtn').onclick = () => {
        // We can reuse openBoardModal from app.js if we can access it.
        // Since we are in project.js module, we can't easily access app.js functions directly if they aren't exported.
        // Best approach: Dispatch event 'createBoard' which app.js listens to.
        window.dispatchEvent(new CustomEvent('createBoardRequest'));
    };
};

const renderBacklog = (project) => {
    const listEl = document.getElementById('backlogList');
    listEl.innerHTML = (project.backlog || []).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).map(task => `
        <div class="backlog-item" data-id="${task.id}">
             <div class="backlog-item-content">
                 <div class="backlog-item-title" contenteditable="true">${task.title}</div>
                 <div class="backlog-item-meta">Added: ${new Date(task.addedAt).toLocaleDateString()}</div>
             </div>
             <div class="backlog-actions">
                 <button class="btn-icon move-to-sprint-btn" data-id="${task.id}" title="Move to Sprint">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                 </button>
                 <button class="btn-icon danger delete-backlog-btn" data-id="${task.id}" title="Delete">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                 </button>
             </div>
        </div>
    `).join('');

    // Edit Title (ContentEditable)
    listEl.querySelectorAll('.backlog-item-title').forEach(el => {
        el.addEventListener('blur', () => {
            const taskId = el.closest('.backlog-item').dataset.id;
            const task = project.backlog.find(t => t.id === taskId);
            if (task && el.textContent.trim() !== task.title) {
                task.title = el.textContent.trim();
                saveState();
                showToast('Task updated', 'success');
            } else if (task) {
                el.textContent = task.title; // Revert if empty
            }
        });
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                el.blur();
            }
        });
    });

    // Delete Logic
    listEl.querySelectorAll('.delete-backlog-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this backlog item?')) {
                const taskId = btn.dataset.id;
                project.backlog = project.backlog.filter(t => t.id !== taskId);
                saveState();
                renderBacklog(project);
                showToast('Task deleted', 'success');
            }
        });
    });

    // Move to Sprint Logic
    listEl.querySelectorAll('.move-to-sprint-btn').forEach(btn => {
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
                        description: '', // Initialize description
                        labels: [],
                        checklist: [],
                        comments: [],
                        attachments: [],
                        initialEstimate: 0,
                        remainingHours: 0,
                        createdAt: new Date().toISOString()
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

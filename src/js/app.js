import { initAuth } from './auth.js';
import { renderBoard } from './board.js';
import { state, saveState, getOrCreateInviteToken, generateInviteToken, getCurrentBoard, getCurrentUser } from './store.js';
import { showToast, generateUniqueProjectName, generateId } from './utils.js';
import { storage } from './config.js';
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
    
    // Render existing projects
    const projectsHtml = state.projects.map(p => `
        <button class="board-list-item ${p.id === state.currentProjectId ? 'active' : ''}" data-id="${p.id}">
            <div class="board-color-dot" style="background: var(--accent-primary)"></div>
            <span class="board-item-name">${p.name}</span>
        </button>
    `).join('');

    // Add "Create New Project" button
    const createBtnHtml = `
        <div class="dropdown-divider"></div>
        <button class="create-board-btn" id="headerCreateProjectBtn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Create new project
        </button>
    `;

    list.innerHTML = projectsHtml + createBtnHtml;

    // Attach listeners to project items
    list.querySelectorAll('.board-list-item').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.id !== state.currentProjectId) {
                state.currentProjectId = btn.dataset.id;
                // Switch to first board of project or clear if none
                const boards = state.boards.filter(b => b.projectId === state.currentProjectId);
                state.currentBoardId = boards.length ? boards[0].id : null;
                saveState();
                renderBoard();
            }
            document.getElementById('projectSelector').classList.remove('active');
        });
    });

    // Attach listener to Create Project button
    document.getElementById('headerCreateProjectBtn')?.addEventListener('click', () => {
        const name = prompt('Enter project name:');
        if (name) {
            const newProject = {
                id: generateId(),
                name,
                description: '',
                ownerId: state.currentUser ? state.currentUser.uid : 'anon',
                members: [],
                backlog: [],
                sprintIds: [],
                labels: [] // Initialize with defaults if needed
            };
            state.projects.push(newProject);
            state.currentProjectId = newProject.id;
            state.currentBoardId = null; // New project has no boards
            saveState();
            renderBoard(); // Will show empty state
            showToast('Project created', 'success');
        }
        document.getElementById('projectSelector').classList.remove('active');
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
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
};

document.getElementById('themeToggle')?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('flowboard-theme', newTheme);
});

// Modal Events (Custom Events)
let currentEditingCard = null; // To store the card being edited

const cardModal = document.getElementById('cardModal');
const cardTitleInput = document.getElementById('cardTitle');
const cardDescriptionInput = document.getElementById('cardDescription');
const cardInitialEstimateInput = document.getElementById('cardInitialEstimate');
const cardRemainingHoursInput = document.getElementById('cardRemainingHours');
const checklistContainer = document.getElementById('checklist');
const newChecklistItemInput = document.getElementById('newChecklistItem');
const addChecklistItemBtn = document.getElementById('addChecklistItemBtn');
const labelPicker = document.getElementById('labelPicker');
const cardDueDateInput = document.getElementById('cardDueDate');
const cardAssigneeSelect = document.getElementById('cardAssignee');
const duplicateCardBtn = document.getElementById('duplicateCardBtn');
const deleteCardBtn = document.getElementById('deleteCardBtn');
const saveCardBtn = cardModal.querySelector('#saveCardBtn');
const cancelCardBtn = cardModal.querySelector('#cancelCardBtn');

const renderLabelPicker = (selectedLabels) => {
    const project = state.projects.find(p => p.id === state.currentProjectId);
    if (!project || !labelPicker) return;

    labelPicker.innerHTML = project.labels.map(label => `
        <button class="label-option ${selectedLabels.includes(label.id) ? 'selected' : ''}"
            data-label-id="${label.id}" data-color="${label.color}" title="${label.description}">
            <span class="label-color" style="background: ${label.color}"></span>
            ${label.name}
        </button>
    `).join('');

    labelPicker.querySelectorAll('.label-option').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            const labelId = btn.dataset.labelId;
            if (currentEditingCard) {
                if (btn.classList.contains('selected')) {
                    if (!currentEditingCard.labels.includes(labelId)) {
                        currentEditingCard.labels.push(labelId);
                    }
                } else {
                    currentEditingCard.labels = currentEditingCard.labels.filter(id => id !== labelId);
                }
                // No need to saveState here, will be saved by saveCardBtn
            }
        });
    });
};

window.addEventListener('openCardModal', (e) => {
    const { cardId, listId } = e.detail;
    const board = getCurrentBoard();
    if (!board) return;

    const list = board.lists.find(l => l.id === listId);
    if (!list) return;

    const card = list.cards.find(c => c.id === cardId);
    if (!card) return;

    currentEditingCard = card; // Store reference to the card being edited

    cardTitleInput.value = card.title;
    cardDescriptionInput.value = card.description;
    cardInitialEstimateInput.value = card.initialEstimate || 0;
    cardRemainingHoursInput.value = card.remainingHours || 0;
    cardDueDateInput.value = card.dueDate || '';

    // Render labels dynamically
    renderLabelPicker(card.labels || []);

    // Populate Assignee Dropdown
    const project = state.projects.find(p => p.id === state.currentProjectId);
    if (project && cardAssigneeSelect) {
        cardAssigneeSelect.innerHTML = '<option value="">Unassigned</option>'; // Always have unassigned option
        project.members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name || member.email;
            cardAssigneeSelect.appendChild(option);
        });
        cardAssigneeSelect.value = card.assigneeId || ''; // Pre-select current assignee
    }

    renderComments(card);
    renderAttachments(card);
    renderChecklist(card);
    
    addCopyLinkBtn(); // Add the copy link button

    cardModal.classList.add('active');
});

// Render Checklist
const renderChecklist = (card) => {
    const container = document.getElementById('checklist');
    if (!container) return;

    if (!card.checklist || card.checklist.length === 0) {
        container.innerHTML = '<div class="empty-checklist">No subtasks yet.</div>';
        return;
    }

    container.innerHTML = card.checklist.map(item => `
        <div class="checklist-item ${item.completed ? 'completed' : ''}">
            <input type="checkbox" class="checklist-checkbox" data-id="${item.id}" ${item.completed ? 'checked' : ''}>
            <span class="checklist-text">${item.text}</span>
            <button class="btn-icon danger delete-checklist-btn" data-id="${item.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        </div>
    `).join('');

    // Toggle Completion
    container.querySelectorAll('.checklist-checkbox').forEach(box => {
        box.addEventListener('change', (e) => {
            const itemId = e.target.dataset.id;
            const item = card.checklist.find(i => i.id === itemId);
            if (item) {
                item.completed = e.target.checked;
                saveState();
                renderChecklist(card);
                renderBoard(); // Update progress on card tile
            }
        });
    });

    // Delete Item
    container.querySelectorAll('.delete-checklist-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.dataset.id;
            card.checklist = card.checklist.filter(i => i.id !== itemId);
            saveState();
            renderChecklist(card);
            renderBoard(); // Update progress on card tile
        });
    });
};

// Add Checklist Item
document.getElementById('addChecklistItemBtn')?.addEventListener('click', () => {
    const input = document.getElementById('newChecklistItem');
    const text = input.value.trim();
    if (text && currentEditingCard) {
        if (!currentEditingCard.checklist) currentEditingCard.checklist = [];
        currentEditingCard.checklist.push({
            id: generateId(),
            text,
            completed: false
        });
        saveState();
        renderChecklist(currentEditingCard);
        renderBoard(); // Update progress
        input.value = '';
    }
});

// Render Comments
const renderComments = (card) => {
    const container = document.getElementById('cardCommentsList');
    if (!container) return;

    if (!card.comments || card.comments.length === 0) {
        container.innerHTML = '<div class="empty-comments">No comments yet.</div>';
        return;
    }

    container.innerHTML = card.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${comment.authorName}</span>
                <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <div class="comment-content">${comment.text}</div>
        </div>
    `).join('');
};

// Render Attachments
const renderAttachments = (card) => {
    const container = document.getElementById('cardAttachmentsList');
    if (!container) return;

    if (!card.attachments || card.attachments.length === 0) {
        container.innerHTML = '<div class="empty-attachments">No attachments yet.</div>';
        return;
    }

    container.innerHTML = card.attachments.map(att => `
        <div class="attachment-item">
            <div class="attachment-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
            </div>
            <div class="attachment-info">
                <a href="${att.url}" target="_blank" class="attachment-name">${att.name}</a>
                <span class="attachment-meta">${new Date(att.uploadedAt).toLocaleDateString()}</span>
            </div>
            <button class="btn-icon danger delete-attachment-btn" data-id="${att.id}" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
    `).join('');

    // Attach delete listeners
    container.querySelectorAll('.delete-attachment-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Delete this attachment?')) {
                const attId = btn.dataset.id;
                const attIndex = card.attachments.findIndex(a => a.id === attId);
                if (attIndex > -1) {
                    const att = card.attachments[attIndex];
                    try {
                        // Create a reference to the file to delete
                        const fileRef = storage.refFromURL(att.url);
                        await fileRef.delete();
                        
                        // Remove from state
                        card.attachments.splice(attIndex, 1);
                        saveState();
                        renderAttachments(card);
                        renderBoard(); // Update board to show/hide icon
                        showToast('Attachment deleted', 'success');
                    } catch (error) {
                        console.error('Error deleting file:', error);
                        showToast('Failed to delete file', 'error');
                    }
                }
            }
        });
    });
};

// Upload Attachment Logic
const attachmentInput = document.getElementById('cardAttachmentInput');
const progressBar = document.getElementById('attachmentProgressBar');
const progressContainer = document.getElementById('attachmentProgressContainer');

attachmentInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !currentEditingCard) return;

    if (!storage) {
        showToast('Storage not configured', 'error');
        return;
    }

    const board = getCurrentBoard();
    const storagePath = `attachments/${board.id}/${currentEditingCard.id}/${Date.now()}_${file.name}`;
    const storageRef = storage.ref(storagePath);
    const uploadTask = storageRef.put(file);

    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';

    uploadTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.style.width = `${progress}%`;
        }, 
        (error) => {
            console.error('Upload error:', error);
            progressContainer.classList.add('hidden');
            showToast('Upload failed', 'error');
            attachmentInput.value = '';
        }, 
        async () => {
            try {
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                const user = getCurrentUser();
                
                const newAttachment = {
                    id: generateId(),
                    name: file.name,
                    url: downloadURL,
                    type: file.type,
                    size: file.size,
                    uploadedAt: new Date().toISOString(),
                    uploadedBy: user ? user.uid : 'anon'
                };

                if (!currentEditingCard.attachments) currentEditingCard.attachments = [];
                currentEditingCard.attachments.push(newAttachment);

                saveState();
                renderAttachments(currentEditingCard);
                renderBoard(); // Update board view to show icon
                
                progressContainer.classList.add('hidden');
                attachmentInput.value = '';
                showToast('File uploaded successfully', 'success');
            } catch (error) {
                console.error('Error saving attachment metadata:', error);
                showToast('Upload succeeded but failed to save metadata', 'warning');
            }
        }
    );
});

// Add Comment Logic
document.getElementById('addCommentBtn')?.addEventListener('click', () => {
    const input = document.getElementById('newCommentInput');
    const text = input.value.trim();
    if (!text || !currentEditingCard) return;

    const user = getCurrentUser();
    const newComment = {
        id: generateId(),
        text,
        authorId: user ? user.uid : 'anon',
        authorName: user ? (user.displayName || user.email) : 'Anonymous',
        createdAt: new Date().toISOString()
    };

    if (!currentEditingCard.comments) currentEditingCard.comments = [];
    currentEditingCard.comments.push(newComment);

    saveState();
    renderComments(currentEditingCard);
    input.value = '';
});

// Save Card
saveCardBtn.addEventListener('click', () => {
    if (!currentEditingCard) return;

    currentEditingCard.title = cardTitleInput.value.trim();
    currentEditingCard.description = cardDescriptionInput.value.trim();
    currentEditingCard.initialEstimate = parseFloat(cardInitialEstimateInput.value) || 0;
    currentEditingCard.remainingHours = parseFloat(cardRemainingHoursInput.value) || 0;
    currentEditingCard.dueDate = cardDueDateInput.value;
    currentEditingCard.assigneeId = cardAssigneeSelect.value || null; // Save assignee ID
    // Labels are updated directly by renderLabelPicker event listeners

    saveState();
    renderBoard(); // Re-render board to show updated card details
    cardModal.classList.remove('active');
    showToast('Card updated!', 'success');
});

cancelCardBtn.addEventListener('click', () => cardModal.classList.remove('active'));

// Existing newUserNoBoards and board modal logic remains...
window.addEventListener('newUserNoBoards', () => openBoardModal());

// Board Modal Elements
const boardModal = document.getElementById('boardModal');
const boardModalTitle = boardModal.querySelector('h2');
const boardNameInput = document.getElementById('boardName');
const boardGoalInput = document.getElementById('boardGoal');
const boardStartDateInput = document.getElementById('boardStartDate');
const boardEndDateInput = document.getElementById('boardEndDate');
const boardColorPicker = boardModal.querySelector('.color-picker');
const saveBoardBtn = document.getElementById('saveBoardBtn');
const cancelBoardBtn = document.getElementById('cancelBoardBtn');

let currentEditingBoardId = null; // To keep track if we're editing or creating

const openBoardModal = (board = null) => {
    boardModal.classList.add('active');
    document.getElementById('boardSelector').classList.remove('active');

    if (board) {
        boardModalTitle.textContent = 'Edit Board';
        boardNameInput.value = board.name;
        boardGoalInput.value = board.goal || '';
        boardStartDateInput.value = board.startDate || '';
        boardEndDateInput.value = board.endDate || '';
        currentEditingBoardId = board.id;

        // Set selected color
        boardColorPicker.querySelectorAll('.color-option').forEach(option => {
            if (option.dataset.color === board.background) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    } else {
        boardModalTitle.textContent = 'Create New Board';
        boardNameInput.value = generateUniqueProjectName();
        boardGoalInput.value = '';
        boardStartDateInput.value = '';
        boardEndDateInput.value = '';
        currentEditingBoardId = null;
        boardColorPicker.querySelector('.color-option').classList.add('selected');
    }
};

// Board Creation
document.getElementById('createBoardBtn')?.addEventListener('click', () => openBoardModal());

// New User No Boards event
window.addEventListener('newUserNoBoards', () => openBoardModal());

// Board color picker logic
boardColorPicker.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-option')) {
        boardColorPicker.querySelectorAll('.color-option').forEach(option => option.classList.remove('selected'));
        e.target.classList.add('selected');
    }
});

// Save Board
saveBoardBtn.addEventListener('click', () => {
    const name = boardNameInput.value.trim();
    const goal = boardGoalInput.value.trim();
    const startDate = boardStartDateInput.value;
    const endDate = boardEndDateInput.value;
    const background = boardColorPicker.querySelector('.color-option.selected')?.dataset.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    if (!name) {
        showToast('Board name cannot be empty', 'error');
        return;
    }
    if (state.currentProjectId === null) {
        showToast('Please select or create a project first.', 'error');
        return;
    }

    if (currentEditingBoardId) {
        // Edit existing board
        const boardIndex = state.boards.findIndex(b => b.id === currentEditingBoardId);
        if (boardIndex > -1) {
            const board = state.boards[boardIndex];
            board.name = name;
            board.goal = goal;
            board.startDate = startDate;
            board.endDate = endDate;
            board.background = background;
            showToast('Board updated!', 'success');
        }
    } else {
        // Create new board
        const newBoard = {
            id: generateId(),
            name,
            goal,
            startDate,
            endDate,
            background,
            projectId: state.currentProjectId,
            owner: state.currentUser ? {
                id: state.currentUser.uid,
                name: state.currentUser.displayName,
                email: state.currentUser.email,
                photoURL: state.currentUser.photoURL
            } : { id: 'anon', name: 'Anonymous', email: 'anon@example.com', photoURL: null },
            members: [],
            lists: [
                { id: generateId(), title: 'To Do', cards: [] },
                { id: generateId(), title: 'In Progress', cards: [] },
                { id: generateId(), title: 'Done', cards: [] }
            ],
            history: [],
            inviteToken: generateInviteToken()
        };
        state.boards.push(newBoard);
        state.currentBoardId = newBoard.id;
        showToast('Board created!', 'success');
    }

    saveState();
    renderBoard();
    boardModal.classList.remove('active');
});

cancelBoardBtn.addEventListener('click', () => boardModal.classList.remove('active'));

// Close modals
document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
        if (e.target === el) {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        }
    });
});

// Function to update board info in header
export const updateBoardInfoInHeader = () => {
    const board = getCurrentBoard();
    const boardInfoEl = document.getElementById('boardInfo');
    const currentBoardGoalEl = document.getElementById('currentBoardGoal');
    const currentBoardDatesEl = document.getElementById('currentBoardDates');

    if (board && boardInfoEl) {
        boardInfoEl.style.display = 'flex'; // Show the info section
        currentBoardGoalEl.textContent = board.goal || 'No sprint goal set';

        let datesText = '';
        if (board.startDate && board.endDate) {
            const start = new Date(board.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const end = new Date(board.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            datesText = `${start} - ${end}`;
        } else if (board.startDate) {
            const start = new Date(board.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            datesText = `Starts: ${start}`;
        } else if (board.endDate) {
            const end = new Date(board.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            datesText = `Ends: ${end}`;
        }
        currentBoardDatesEl.textContent = datesText;
    } else if (boardInfoEl) {
        boardInfoEl.style.display = 'none'; // Hide if no board selected
    }
};

// Check for Card ID in URL (Deep Linking)
const checkCardInURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('card');
    
    if (cardId) {
        // Find card in all boards
        for (const board of state.boards) {
            for (const list of board.lists) {
                const card = list.cards.find(c => c.id === cardId);
                if (card) {
                    state.currentBoardId = board.id;
                    if (board.projectId) state.currentProjectId = board.projectId;
                    saveState();
                    renderBoard();
                    
                    // Open Modal
                    window.dispatchEvent(new CustomEvent('openCardModal', { detail: { cardId, listId: list.id } }));
                    return;
                }
            }
        }
        showToast('Card not found', 'error');
    }
};

// Add Copy Link Button to Card Modal logic
const addCopyLinkBtn = () => {
    const header = cardModal.querySelector('.card-modal-title');
    if (header.querySelector('.copy-card-link-btn')) return; // Already added

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-icon copy-card-link-btn';
    copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
    copyBtn.title = "Copy Link to Card";
    copyBtn.style.marginLeft = '10px';
    
    copyBtn.addEventListener('click', async () => {
        if (!currentEditingCard) return;
        const url = new URL(window.location.href);
        url.searchParams.set('card', currentEditingCard.id);
        
        try {
            await navigator.clipboard.writeText(url.toString());
            showToast('Link copied to clipboard', 'success');
        } catch (err) {
            showToast('Failed to copy link', 'error');
        }
    });

    header.appendChild(copyBtn);
};

// Hook into openCardModal to add the button
const originalOpenCardModal = window.dispatchEvent; 
// We can't easily hook dispatchEvent. 
// Instead, we modify the existing event listener or add a new one that runs after.
// Since we have the listener defined above, let's call addCopyLinkBtn inside it.
// I'll update the listener block in the next replacement.

// Call checkCardInURL on init
// We need to call this after state is loaded. 
// In initAuth -> loadState -> renderBoard -> (then check card)
// I'll add an event listener for a new event 'appReady' or similar, or just call it if we modify initAuth.
// For now, let's export it and call it from initAuth in auth.js if possible, or listen for a custom event.
window.addEventListener('appReady', checkCardInURL);

window.addEventListener('createBoardRequest', () => {
    openBoardModal();
});

// Edit Board button in header
document.getElementById('boardInfo')?.addEventListener('click', () => {
    const board = getCurrentBoard();
    if (board) {
        openBoardModal(board);
    }
});


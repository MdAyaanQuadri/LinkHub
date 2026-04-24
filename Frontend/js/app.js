let currentFolderId = null;
let currentPath = []; // Array of {id, name}
let allContent = { folders: [], links: [] };

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const user = auth.getUser();
    if (user) {
        document.getElementById('user-name').textContent = user.username;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-initial').textContent = user.username.charAt(0).toUpperCase();
    }

    initialize();

    // Event Listeners
    document.getElementById('folder-form').addEventListener('submit', createFolder);
    document.getElementById('link-form').addEventListener('submit', createLink);
    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('nav-all').addEventListener('click', (e) => {
        e.preventDefault();
        navigateToFolder(null, 'All Folders');
    });
});

async function initialize() {
    await navigateToFolder(null, 'All Folders');
    await loadSidebarFolders();
}

async function loadSidebarFolders() {
    try {
        const response = await api.get('/folders?parent=null');
        const folders = response.folders || [];
        const foldersList = document.getElementById('folders-list');
        
        foldersList.innerHTML = '';
        folders.forEach(folder => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'nav-item';
            item.innerHTML = `<i data-lucide="folder"></i> <span>${folder.name}</span>`;
            item.onclick = (e) => {
                e.preventDefault();
                navigateToFolder(folder._id, folder.name);
            };
            foldersList.appendChild(item);
        });
        lucide.createIcons();
    } catch (err) {
        console.error('Sidebar load failed:', err);
    }
}

async function navigateToFolder(folderId, folderName) {
    currentFolderId = folderId;
    
    if (folderId === null) {
        currentPath = [];
    } else {
        const index = currentPath.findIndex(p => p.id === folderId);
        if (index !== -1) {
            currentPath = currentPath.slice(0, index + 1);
        } else {
            currentPath.push({ id: folderId, name: folderName });
        }
    }

    updateBreadcrumbs();
    await loadContent(folderId);
}

function updateBreadcrumbs() {
    const breadcrumbs = document.getElementById('breadcrumbs');
    breadcrumbs.innerHTML = '';

    const rootItem = document.createElement('span');
    rootItem.style.cursor = 'pointer';
    rootItem.innerHTML = `<i data-lucide="home" style="width: 14px;"></i> Home`;
    rootItem.onclick = () => navigateToFolder(null, 'All Folders');
    breadcrumbs.appendChild(rootItem);

    currentPath.forEach((path, i) => {
        const separator = document.createElement('span');
        separator.textContent = '/';
        breadcrumbs.appendChild(separator);

        const item = document.createElement('span');
        item.textContent = path.name;
        item.style.cursor = 'pointer';
        if (i === currentPath.length - 1) {
            item.style.color = 'var(--text-main)';
            item.style.fontWeight = '600';
        }
        item.onclick = () => navigateToFolder(path.id, path.name);
        breadcrumbs.appendChild(item);
    });
    lucide.createIcons();
}

async function loadContent(folderId = null) {
    try {
        const parentQuery = folderId ? `?parent=${folderId}` : '?parent=null';
        const folderResponse = await api.get(`/folders${parentQuery}`);
        
        let links = [];
        if (folderId !== null) {
            const linkResponse = await api.get(`/links?folderId=${folderId}`);
            links = linkResponse.links || [];
        }

        allContent = {
            folders: folderResponse.folders || [],
            links: links
        };

        renderContent(allContent);

        const title = document.getElementById('view-title');
        const subtitle = document.getElementById('view-subtitle');
        const addLinkBtn = document.getElementById('add-link-btn');

        if (folderId === null) {
            title.textContent = 'All Folders';
            subtitle.textContent = '';
            addLinkBtn.style.display = 'none';
        } else {
            title.textContent = currentPath[currentPath.length - 1].name;
            subtitle.textContent = '';
            addLinkBtn.style.display = 'flex';
        }
    } catch (err) {
        console.error('Failed to load content:', err);
    }
}

function renderContent({ folders, links }) {
    const grid = document.getElementById('link-grid');
    grid.innerHTML = '';

    if (folders.length === 0 && links.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
                <i data-lucide="folder-open" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>This ${currentFolderId ? 'folder' : 'space'} is empty.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    // Render Folders
    folders.forEach(folder => {
        const card = document.createElement('div');
        card.className = 'link-card folder-card glass animate-fade-in';
        card.innerHTML = `
            <div class="link-content">
                <div class="link-card-header">
                    <div class="link-icon" style="background: rgba(99, 102, 241, 0.1);">
                        <i data-lucide="folder" style="width: 20px; color: var(--primary);"></i>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        ${folder.visibility === 'public' ? '<span style="font-size: 0.65rem; background: var(--success); padding: 2px 6px; border-radius: 10px; height: fit-content;">Public</span>' : ''}
                        <div class="dropdown">
                            <button class="btn btn-secondary" style="padding: 0.4rem;" onclick="event.stopPropagation(); toggleDropdown(this)">
                                <i data-lucide="more-vertical" style="width: 16px;"></i>
                            </button>
                            <div class="dropdown-content glass">
                                ${folder.visibility === 'public' ? `
                                <a href="#" onclick="event.stopPropagation(); copyShareLink('${folder._id}')">
                                    <i data-lucide="copy"></i>
                                    Copy Link
                                </a>` : ''}
                                <a href="#" onclick="event.stopPropagation(); toggleVisibility('${folder._id}', '${folder.visibility}')">
                                    <i data-lucide="${folder.visibility === 'public' ? 'lock' : 'share-2'}"></i>
                                    ${folder.visibility === 'public' ? 'Make Private' : 'Make Public'}
                                </a>
                                <a href="#" style="color: var(--danger);" onclick="event.stopPropagation(); deleteFolder('${folder._id}')">
                                    <i data-lucide="trash-2"></i>
                                    Delete
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <h3 class="link-card-title">${folder.name}</h3>
            </div>
        `;
        card.onclick = () => navigateToFolder(folder._id, folder.name);
        grid.appendChild(card);
    });

    // Render Links
    links.forEach(link => {
        const card = document.createElement('div');
        card.className = 'link-card glass animate-fade-in';
        
        const thumbnailHtml = link.previewImage 
            ? `<img src="${link.previewImage}" class="link-thumbnail" onerror="this.style.display='none'">`
            : `<div class="link-thumbnail" style="display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.02);">
                 <i data-lucide="globe" style="width: 32px; color: var(--text-muted); opacity: 0.3;"></i>
               </div>`;

        card.innerHTML = `
            ${thumbnailHtml}
            <div class="link-content">
                <div class="link-card-header">
                    <div class="link-icon">
                        <i data-lucide="external-link" style="width: 18px; color: var(--primary);"></i>
                    </div>
                    <button class="btn btn-secondary" style="padding: 0.4rem;" onclick="event.stopPropagation(); deleteLink('${link._id}')">
                        <i data-lucide="trash-2" style="width: 16px; color: var(--danger);"></i>
                    </button>
                </div>
                <h3 class="link-card-title" title="${link.title || link.url}">${link.title || 'Untitled Link'}</h3>
                <div style="margin-top: auto; padding-top: 1rem; display: flex; justify-content: flex-end;">
                    <a href="${link.url}" target="_blank" class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;" onclick="event.stopPropagation()">
                        Visit Site
                    </a>
                </div>
            </div>
        `;
        card.onclick = () => window.open(link.url, '_blank');
        grid.appendChild(card);
    });

    lucide.createIcons();
}

async function createFolder(e) {
    e.preventDefault();
    const name = document.getElementById('folder-name').value;
    const description = document.getElementById('folder-desc').value;

    try {
        await api.post('/folders', { name, description, parentFolderId: currentFolderId });
        hideModal('folder-modal');
        document.getElementById('folder-form').reset();
        await loadContent(currentFolderId);
        if (currentFolderId === null) loadSidebarFolders();
    } catch (err) {
        showAlert(err.message);
    }
}

async function createLink(e) {
    e.preventDefault();
    const url = document.getElementById('link-url').value;
    const title = document.getElementById('link-title').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Processing...';
        lucide.createIcons();

        await api.post('/links', { url, title, folderId: currentFolderId });
        
        hideModal('link-modal');
        document.getElementById('link-form').reset();
        document.getElementById('title-field').style.display = 'none';
        await loadContent(currentFolderId);
    } catch (err) {
        if (err.message.includes('Metadata scraping failed')) {
            document.getElementById('title-field').style.display = 'block';
            document.getElementById('link-title').required = true;
            document.getElementById('link-title').focus();
            showAlert("We couldn't automatically find a title for this URL. Please enter one manually.", "Scraper Failed");
        } else {
            showAlert(err.message);
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        lucide.createIcons();
    }
}

async function deleteFolder(id) {
    showConfirm('Are you sure you want to delete this folder? Subfolders must be empty.', async () => {
        try {
            await api.delete(`/folders/${id}`);
            await loadContent(currentFolderId);
            if (currentFolderId === null) loadSidebarFolders();
        } catch (err) {
            showAlert(err.message);
        }
    });
}

async function deleteLink(id) {
    showConfirm('Do you want to permanently delete this link?', async () => {
        try {
            await api.delete(`/links/${id}`);
            await loadContent(currentFolderId);
        } catch (err) {
            showAlert(err.message);
        }
    });
}

function toggleDropdown(btn) {
    const dropdown = btn.nextElementSibling;
    // Close all other dropdowns
    document.querySelectorAll('.dropdown-content').forEach(d => {
        if (d !== dropdown) d.classList.remove('show');
    });
    dropdown.classList.toggle('show');
}

async function toggleVisibility(id, currentVisibility) {
    const newVisibility = currentVisibility === 'public' ? 'private' : 'public';
    try {
        const folder = allContent.folders.find(f => f._id === id);
        await api.put(`/folders/${id}`, { name: folder.name, visibility: newVisibility });
        document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
        await loadContent(currentFolderId);
        if (currentFolderId === null) loadSidebarFolders();
    } catch (err) {
        showAlert(err.message);
    }
}

function copyShareLink(id) {
    const url = `${window.location.origin}${window.location.pathname.replace('dashboard.html', 'shared.html')}?id=${id}`;
    navigator.clipboard.writeText(url).then(() => {
        showAlert('Link copied to clipboard! You can now share it with anyone.', 'Link Copied');
        document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
    });
}

// Global listener to close dropdowns
window.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
    }
});

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filteredFolders = allContent.folders.filter(f => f.name.toLowerCase().includes(query));
    const filteredLinks = allContent.links.filter(l => (l.title && l.title.toLowerCase().includes(query)) || l.url.toLowerCase().includes(query));
    renderContent({ folders: filteredFolders, links: filteredLinks });
}

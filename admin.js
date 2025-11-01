// admin.js - Fixed & Fully Working Admin Panel (Patched with proxy image + fallback)

let currentUser = null;

// On page load: restore session
document.addEventListener('DOMContentLoaded', function () {
    const saved = localStorage.getItem('myVoyagesAdminUser');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            if (currentUser.username && currentUser.password) {
                showAdminSection();
                loadStories();
            }
        } catch (e) {
            localStorage.removeItem('myVoyagesAdminUser');
        }
    }
});

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    if (!username || !password) {
        showError(errorDiv, 'Please enter both username and password');
        return;
    }

    try {
        const isValid = await supabase.validateCredentials(username, password);
        if (isValid) {
            currentUser = { username, password, loggedIn: true };
            localStorage.setItem('myVoyagesAdminUser', JSON.stringify(currentUser));
            showAdminSection();
            await loadStories();
        } else {
            showError(errorDiv, 'Invalid username or password');
        }
    } catch (error) {
        showError(errorDiv, 'Login failed: ' + error.message);
    }
}

function showAdminSection() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('admin-section').classList.remove('hidden');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('myVoyagesAdminUser');
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function showAddForm() {
    document.getElementById('add-story-form').classList.remove('hidden');
    document.getElementById('add-error').style.display = 'none';
    document.getElementById('add-success').style.display = 'none';

    // Reset form
    document.getElementById('story-title').value = '';
    document.getElementById('story-category').value = 'local';
    document.getElementById('story-content').value = '';
    document.getElementById('story-image').value = '';
    document.getElementById('google-drive-url').value = '';
    document.getElementById('story-location').value = '';
    document.getElementById('story-date').value = '';
}

function hideAddForm() {
    document.getElementById('add-story-form').classList.add('hidden');
}

// Convert Google Drive URL
function getDirectGoogleDriveUrl(driveUrl) {
    driveUrl = driveUrl.trim();
    if (driveUrl.includes("uc?export=view")) return driveUrl;

    const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/);
    if (match) {
        const fileId = match[1] || match[2];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return driveUrl;
}

function convertGoogleDriveUrl() {
    const driveUrl = document.getElementById('google-drive-url').value.trim();
    const imageUrl = document.getElementById('story-image');

    if (!driveUrl) {
        alert('Please paste a Google Drive URL first');
        return;
    }

    if (supabase && supabase.convertGoogleDriveUrl) {
        const proxyUrl = supabase.convertGoogleDriveUrl(driveUrl);
        imageUrl.value = proxyUrl;
    } else {
        const directUrl = getDirectGoogleDriveUrl(driveUrl);
        imageUrl.value = directUrl;
    }

    const successDiv = document.getElementById('add-success');
    successDiv.textContent = 'Google Drive URL converted!';
    successDiv.style.display = 'block';
    setTimeout(() => successDiv.style.display = 'none', 3000);
}

async function addStory() {
    if (!currentUser?.username || !currentUser?.password) {
        alert("Please log in first");
        return;
    }

    const title = document.getElementById('story-title').value.trim();
    const category = document.getElementById('story-category').value;
    const content = document.getElementById('story-content').value.trim();
    const imageUrl = document.getElementById('story-image').value.trim();
    const location = document.getElementById('story-location').value.trim();
    const date = document.getElementById('story-date').value;

    const errorDiv = document.getElementById('add-error');
    const successDiv = document.getElementById('add-success');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    if (!title || !content) {
        showError(errorDiv, 'Title and story content are required');
        return;
    }

    const storyData = {
        title,
        category,
        story_content: content,
        image_url: imageUrl || null,
        location: location || null,
        travel_date: date || null
    };

    try {
        await supabase.createStory(storyData, currentUser);
        showSuccess(successDiv, 'Story added successfully!');
        hideAddForm();
        await loadStories();
    } catch (error) {
        showError(errorDiv, 'Failed to add: ' + error.message);
    }
}

async function loadStories() {
    const container = document.getElementById('stories-container');
    container.innerHTML = '<p>Loading stories...</p>';

    try {
        const data = await supabase.getStories();
        const stories = data.stories || [];

        if (stories.length === 0) {
            container.innerHTML = '<p>No stories yet. Add your first one!</p>';
            return;
        }

        container.innerHTML = stories.map(story => {
            const imageUrl = story.image_url
                ? supabase.getProxyImageUrl(story.image_url)
                : null;

            return `
                <div class="story-card" data-id="${story.id}">
                    ${imageUrl
                        ? `<img src="${imageUrl}" 
                                 alt="${escapeHtml(story.title)}" 
                                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjBGMEMwIi8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0xMzcuNSA5My43NUwxNTAgMTA2LjI1TDE2Mi41IDkzLjc1TDE3NSA4MS4yNUwxNjIuNSA2OC43NUwxNTAgODEuMjVMMTM3LjUgNjguNzVMMTI1IDgxLjI1TDEzNy41IDkzLjc1WiIgZmlsbD0iI0NDQyIvPgo8L3N2Zz4K';"
                                 style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;">`
                        : `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      display: flex; align-items: center; justify-content: center; 
                                      color: white; font-size: 36px; height: 180px; border-radius: 8px; margin-bottom: 12px;">
                             Document
                           </div>`
                    }
                    <h4 style="margin: 0 0 8px 0; font-size: 1.1em; color: #333;">${escapeHtml(story.title)}</h4>
                    <p style="margin: 4px 0; font-size: 0.9em; color: #555;">
                        <strong>Location:</strong> ${escapeHtml(story.location || '—')}
                    </p>
                    <p style="margin: 4px 0; font-size: 0.9em; color: #555;">
                        <strong>Date:</strong> ${story.travel_date || '—'}
                    </p>
                    <p style="margin: 8px 0; font-size: 0.85em; color: #666; line-height: 1.4;">
                        ${escapeHtml(story.story_content.substring(0, 120))}${story.story_content.length > 120 ? '...' : ''}
                    </p>
                    <div style="margin-top: 12px; display: flex; gap: 8px;">
                        <button class="btn btn-secondary" onclick="editStory(${story.id})">Edit</button>
                        <button class="btn" onclick="deleteStory(${story.id})" style="background: #dc3545;">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = `<p style="color: #dc3545;">Error: ${escapeHtml(error.message)}</p>`;
    }
}

function editStory(id) {
    const card = document.querySelector(`.story-card[data-id="${id}"]`);
    if (!card) return;

    const title = card.querySelector('h4').textContent;
    const location = card.querySelector('p:nth-of-type(1)').textContent.replace('Location: ', '').trim();
    const date = card.querySelector('p:nth-of-type(2)').textContent.replace('Date: ', '').trim();
    const preview = card.querySelector('p:nth-of-type(3)').textContent;
    const fullContent = preview.endsWith('...') 
        ? prompt('Full story content (paste from modal or DB):', '') 
        : preview;

    // Fill form
    document.getElementById('story-title').value = title;
    document.getElementById('story-location').value = location === '—' ? '' : location;
    document.getElementById('story-date').value = date === '—' ? '' : date;
    document.getElementById('story-content').value = fullContent || '';

    // Change button
    const addBtn = document.querySelector('#add-story-form .btn');
    addBtn.textContent = 'Update Story';
    addBtn.onclick = () => updateStory(id);

    showAddForm();
}
async function updateStory(id) {
    if (!currentUser) {
        alert("Please log in again");
        return;
    }

    const title = document.getElementById('story-title').value.trim();
    const category = document.getElementById('story-category').value;
    const content = document.getElementById('story-content').value.trim();
    const imageUrl = document.getElementById('story-image').value.trim();
    const location = document.getElementById('story-location').value.trim();
    const date = document.getElementById('story-date').value;

    if (!title || !content) {
        showError(document.getElementById('add-error'), 'Title and content required');
        return;
    }

    const storyData = {
        title, category, story_content: content,
        image_url: imageUrl || null,
        location: location || null,
        travel_date: date || null
    };

    try {
        await supabase.updateStory(id, storyData, currentUser);
        showSuccess(document.getElementById('add-success'), 'Story updated!');
        hideAddForm();
        await loadStories();
    } catch (error) {
        showError(document.getElementById('add-error'), 'Update failed: ' + error.message);
    }
}
async function deleteStory(id) {
    if (!confirm('Delete this story permanently?')) return;

    if (!currentUser?.username || !currentUser?.password) {
        alert("Please log in again");
        return;
    }

    try {
        await supabase.deleteStory(id, currentUser);
        alert('Story deleted!');
        await loadStories();
    } catch (error) {
        alert('Delete failed: ' + error.message);
    }
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function showSuccess(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => element.style.display = 'none', 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export to window
window.login = login;
window.logout = logout;
window.showAddForm = showAddForm;
window.hideAddForm = hideAddForm;
window.convertGoogleDriveUrl = convertGoogleDriveUrl;
window.addStory = addStory;
window.loadStories = loadStories;
window.editStory = editStory;
window.updateStory = updateStory;
window.deleteStory = deleteStory;

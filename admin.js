// admin.js - Fixed & Fully Working Admin Panel

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
            // Save full credentials
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

    // Use the supabase helper function if available
    if (supabase && supabase.convertGoogleDriveUrl) {
        const proxyUrl = supabase.convertGoogleDriveUrl(driveUrl);
        imageUrl.value = proxyUrl;
    } else {
        // Fallback to the original implementation
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
        await supabase.createStory(storyData, currentUser); // Pass full credentials
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

        container.innerHTML = stories.map(story => `
            <div class="story-card" data-id="${story.id}">
                ${story.image_url ? `<img src="${story.image_url}" alt="${escapeHtml(story.title)}" onerror="this.style.display='none'">` : ''}
                <h4>${escapeHtml(story.title)}</h4>
                <p><strong>Category:</strong> ${escapeHtml(story.category.replace('_', ' '))}</p>
                <p><strong>Location:</strong> ${escapeHtml(story.location || 'N/A')}</p>
                <p><strong>Date:</strong> ${story.travel_date || 'N/A'}</p>
                <p>${escapeHtml(story.story_content.substring(0, 100))}${story.story_content.length > 100 ? '...' : ''}</p>
                <div style="margin-top: 10px;">
                    <button class="btn btn-secondary" onclick="editStory(${story.id})">Edit</button>
                    <button class="btn" onclick="deleteStory(${story.id})" style="background: #dc3545; margin-left: 10px;">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function editStory(id) {
    alert('Edit feature coming soon! Delete and re-add for now.');
}

async function deleteStory(id) {
    if (!confirm('Delete this story permanently?')) return;

    if (!currentUser?.username || !currentUser?.password) {
        alert("Please log in again");
        return;
    }

    try {
        await supabase.deleteStory(id, currentUser); // Pass credentials
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
window.deleteStory = deleteStory;
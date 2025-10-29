// Admin Panel JavaScript

let currentUser = null;

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user was logged in previously (simple session check)
    const savedUser = localStorage.getItem('myVoyagesAdminUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showAdminSection();
    }
});

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (!username || !password) {
        showError(errorDiv, 'Please enter both username and password');
        return;
    }
    
    // Validate credentials using Supabase
    supabase.validateCredentials(username, password)
        .then(isValid => {
            if (isValid) {
                currentUser = { username: username, loggedIn: true };
                localStorage.setItem('myVoyagesAdminUser', JSON.stringify(currentUser));
                showAdminSection();
                loadStories();
            } else {
                showError(errorDiv, 'Invalid username or password');
            }
        })
        .catch(error => {
            showError(errorDiv, 'Login failed: ' + error.message);
        });
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
    
    // Clear form
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

function convertGoogleDriveUrl() {
    const driveUrl = document.getElementById('google-drive-url').value.trim();
    const imageUrl = document.getElementById('story-image');
    
    if (!driveUrl) {
        alert('Please paste a Google Drive URL first');
        return;
    }
    
    const directUrl = window.convertGoogleDriveUrl(driveUrl);
    imageUrl.value = directUrl;
    
    // Show success message
    const successDiv = document.getElementById('add-success');
    successDiv.textContent = 'Google Drive URL converted successfully!';
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

function addStory() {
    const title = document.getElementById('story-title').value.trim();
    const category = document.getElementById('story-category').value;
    const content = document.getElementById('story-content').value.trim();
    const imageUrl = document.getElementById('story-image').value.trim();
    const location = document.getElementById('story-location').value.trim();
    const date = document.getElementById('story-date').value;
    
    const errorDiv = document.getElementById('add-error');
    const successDiv = document.getElementById('add-success');
    
    // Hide previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    if (!title || !content) {
        showError(errorDiv, 'Please fill in title and story content');
        return;
    }
    
    const storyData = {
        title,
        category,
        story_content: content,
        image_url: imageUrl || null,
        location: location || null,
        travel_date: date || null,
        created_at: new Date().toISOString()
    };
    
    supabase.createStory(storyData)
        .then(result => {
            showSuccess(successDiv, 'Story added successfully!');
            hideAddForm();
            loadStories();
        })
        .catch(error => {
            showError(errorDiv, 'Failed to add story: ' + error.message);
        });
}

function loadStories() {
    const container = document.getElementById('stories-container');
    container.innerHTML = '<p>Loading stories...</p>';
    
    supabase.getStories()
        .then(stories => {
            if (stories.length === 0) {
                container.innerHTML = '<p>No stories found. Add your first story!</p>';
                return;
            }
            
            container.innerHTML = stories.map(story => `
                <div class="story-card" data-id="${story.id}">
                    ${story.image_url ? `<img src="${story.image_url}" alt="${story.title}" onerror="this.style.display='none'">` : ''}
                    <h4>${escapeHtml(story.title)}</h4>
                    <p><strong>Category:</strong> ${escapeHtml(story.category.replace('_', ' '))}</p>
                    <p><strong>Location:</strong> ${escapeHtml(story.location || 'Not specified')}</p>
                    <p><strong>Date:</strong> ${story.travel_date || 'Not specified'}</p>
                    <p>${escapeHtml(story.story_content.substring(0, 100))}${story.story_content.length > 100 ? '...' : ''}</p>
                    <div style="margin-top: 10px;">
                        <button class="btn btn-secondary" onclick="editStory(${story.id})">Edit</button>
                        <button class="btn" onclick="deleteStory(${story.id})" style="background: #dc3545; margin-left: 10px;">Delete</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            container.innerHTML = `<p>Error loading stories: ${error.message}</p>`;
        });
}

function editStory(id) {
    // For simplicity, we'll just reload the page to the add form with prefilled data
    // In a full implementation, you'd create an edit form
    alert('Edit functionality would open an edit form here. For now, please delete and recreate the story.');
}

function deleteStory(id) {
    if (!confirm('Are you sure you want to delete this story?')) {
        return;
    }
    
    supabase.deleteStory(id)
        .then(() => {
            loadStories();
            alert('Story deleted successfully!');
        })
        .catch(error => {
            alert('Failed to delete story: ' + error.message);
        });
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function showSuccess(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export functions for use in HTML
window.login = login;
window.logout = logout;
window.showAddForm = showAddForm;
window.hideAddForm = hideAddForm;
window.convertGoogleDriveUrl = convertGoogleDriveUrl;
window.addStory = addStory;
window.loadStories = loadStories;
window.editStory = editStory;
window.deleteStory = deleteStory;

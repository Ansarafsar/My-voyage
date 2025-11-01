// Dynamic Story Loader for Category Pages with Modal Popups
let currentPage = 1;
const storiesPerPage = 6;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    currentPage = parseInt(urlParams.get('page')) || 1;
    
    loadCategoryStories();
    setupPagination();
    createModalStructure();
});

function createModalStructure() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('story-modal')) {
        const modalHTML = `
            <div id="story-modal" class="modal-backdrop">
                <div class="story-modal">
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                    <img id="modal-image" class="modal-image" src="" alt="">
                    <div class="modal-content">
                        <h2 id="modal-title" class="modal-title"></h2>
                        <div class="modal-meta">
                            <div id="modal-location" class="modal-location">
                                <span>📍</span>
                                <span></span>
                            </div>
                            <div id="modal-date" class="modal-date">
                                <span>📅</span>
                                <span></span>
                            </div>
                        </div>
                        <div id="modal-story" class="modal-story"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

function loadCategoryStories() {
    const category = getCategoryFromUrl();
    const container = document.getElementById('dynamic-stories-container');
    
    if (!container) {
        console.log('Container not found');
        return;
    }
    
    container.innerHTML = '<div style="text-align: center; padding: 40px; grid-column: 1/-1;"><p>Loading stories...</p></div>';
    
    supabase.getStories(category)
        .then(data => {
            const allStories = data.stories || [];
            const categoryStories = category ? 
                allStories.filter(story => story.category === category) : 
                allStories;
                
            const totalCount = categoryStories.length;
            const totalPages = Math.ceil(totalCount / storiesPerPage);
            
            const startIndex = (currentPage - 1) * storiesPerPage;
            const endIndex = startIndex + storiesPerPage;
            const stories = categoryStories.slice(startIndex, endIndex);
            
            if (categoryStories.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px; grid-column: 1/-1; background: #f8f9fa; border-radius: 12px;">
                        <h3 style="color: #6c757d; margin-bottom: 10px;">No stories yet!</h3>
                        <p style="color: #999;">Be the first to add a story to this category.</p>
                    </div>
                `;
                hidePagination();
                return;
            }
            
            if (stories.length === 0 && totalPages > 0) {
                window.location.href = updatePageInUrl(totalPages);
                return;
            }
            
            // Generate story cards
            const storiesHTML = stories.map(story => `
    <div class="story-card" onclick="openModal(${story.id})">
        ${story.image_url ? 
            `<img src="${supabase.getProxyImageUrl ? 
                supabase.getProxyImageUrl(story.image_url) : 
                story.image_url}" 
                alt="${escapeHtml(story.title)}" 
                class="story-card-image" 
                onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjBGMEMwIi8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0xMzcuNSA5My43NUwxNTAgMTA2LjI1TDE2Mi41IDkzLjc1TDE3NSA4MS4yNUwxNjIuNSA2OC43NUwxNTAgODEuMjVMMTM3LjUgNjguNzVMMTI1IDgxLjI1TDEzNy41IDkzLjc1WiIgZmlsbD0iI0NDQyIvPgo8L3N2Zz4K'">` : 
            `<div class="story-card-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">📝</div>`
        }
        <div class="story-card-content">
            <h3 class="story-card-title">${escapeHtml(story.title)}</h3>
            <p class="story-card-preview">${escapeHtml(story.story_content)}</p>
            <div class="story-card-meta">
                ${story.location ? 
                    `<div class="story-card-location">
                        <span>📍</span>
                        <span>${escapeHtml(story.location)}</span>
                    </div>` : '<div></div>'
                }
                ${story.travel_date ? 
                    `<div class="story-card-date">
                        <span>📅</span>
                        <span>${story.travel_date}</span>
                    </div>` : ''
                }
            </div>
        </div>
    </div>
`).join('');
            
            container.innerHTML = storiesHTML;
            updatePagination(totalPages, totalCount);
            
        })
        .catch(error => {
            console.error('Error loading stories:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1/-1; background: #f8d7da; border-radius: 12px; color: #721c24;">
                    <p>Unable to load stories. Please check your connection and try again.</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Error: ${error.message}</p>
                </div>
            `;
            hidePagination();
        });
}

function openModal(storyId) {
    const category = getCategoryFromUrl();
    
    supabase.getStories(category)
        .then(data => {
            const allStories = data.stories || [];
            const story = allStories.find(s => s.id === storyId);
            
            if (!story) return;
            
            // Populate modal content
            const modal = document.getElementById('story-modal');
            const modalImage = document.getElementById('modal-image');
            const modalTitle = document.getElementById('modal-title');
            const modalLocation = document.getElementById('modal-location');
            const modalDate = document.getElementById('modal-date');
            const modalStory = document.getElementById('modal-story');
            
            // Set image with proxy
            if (story.image_url) {
                modalImage.src = supabase.getProxyImageUrl ? 
                    supabase.getProxyImageUrl(story.image_url) : 
                    story.image_url;
                modalImage.alt = escapeHtml(story.title);
                modalImage.style.display = 'block';
            } else {
                modalImage.style.display = 'none';
            }
            
            // Set title
            modalTitle.textContent = story.title;
            
            // Set location
            if (story.location) {
                modalLocation.style.display = 'flex';
                modalLocation.querySelector('span:last-child').textContent = story.location;
            } else {
                modalLocation.style.display = 'none';
            }
            
            // Set date
            if (story.travel_date) {
                modalDate.style.display = 'flex';
                modalDate.querySelector('span:last-child').textContent = story.travel_date;
            } else {
                modalDate.style.display = 'none';
            }
            
            // Set story content
            modalStory.textContent = story.story_content;
            
            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        })
        .catch(error => {
            console.error('Error loading story:', error);
            alert('Unable to load story. Please try again.');
        });
}


function closeModal() {
    const modal = document.getElementById('story-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal when clicking backdrop
document.addEventListener('click', function(e) {
    if (e.target.id === 'story-modal') {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

function setupPagination() {
    if (!document.getElementById('pagination-container')) {
        const container = document.getElementById('dynamic-stories-container');
        const paginationHTML = `
            <div id="pagination-container" style="display: none;">
                <div id="page-info"></div>
                <div id="pagination-controls"></div>
            </div>
        `;
        container.insertAdjacentHTML('afterend', paginationHTML);
    }
}

function updatePagination(totalPages, totalCount) {
    const container = document.getElementById('pagination-container');
    const controls = document.getElementById('pagination-controls');
    const pageInfo = document.getElementById('page-info');
    
    if (totalPages <= 1) {
        hidePagination();
        return;
    }
    
    container.style.display = 'block';
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})">&laquo; Prev</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span style="padding: 8px;">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<button class="${activeClass}" onclick="changePage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span style="padding: 8px;">...</span>`;
        }
        paginationHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})">Next &raquo;</button>`;
    }
    
    controls.innerHTML = paginationHTML;
    
    // Update page info
    const startItem = (currentPage - 1) * storiesPerPage + 1;
    const endItem = Math.min(currentPage * storiesPerPage, totalCount);
    pageInfo.innerHTML = `Showing ${startItem}-${endItem} of ${totalCount} stories`;
}

function hidePagination() {
    const container = document.getElementById('pagination-container');
    if (container) {
        container.style.display = 'none';
    }
}

function changePage(newPage) {
    currentPage = newPage;
    window.location.href = updatePageInUrl(newPage);
}

function updatePageInUrl(page) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    return url.pathname + url.search + url.hash;
}

function getCategoryFromUrl() {
    const path = window.location.pathname;
    if (path.includes('local.html')) return 'local';
    if (path.includes('interstate.html')) return 'interstate';
    if (path.includes('international.html')) return 'international';
    if (path.includes('speechless-people.html')) return 'speechless_people';
    return null;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export functions
window.loadCategoryStories = loadCategoryStories;
window.changePage = changePage;
window.openModal = openModal;
window.closeModal = closeModal;
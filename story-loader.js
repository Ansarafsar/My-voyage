// Dynamic Story Loader for Category Pages with Pagination
// This script dynamically loads stories from Supabase database

let currentSupabase;
let currentPage = 1;
const storiesPerPage = 6; // Number of stories per page

// Initialize Supabase client
document.addEventListener('DOMContentLoaded', function() {
    if (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL_HERE') {
        currentSupabase = new SupabaseClient(SUPABASE_CONFIG);
        
        // Get page from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        currentPage = parseInt(urlParams.get('page')) || 1;
        
        loadCategoryStories();
        setupPagination();
    } else {
        console.warn('Supabase not configured or stories container not found');
    }
});

function loadCategoryStories() {
    const category = getCategoryFromUrl();
    const container = document.getElementById('dynamic-stories-container');
    
    if (!container || !currentSupabase) {
        console.log('Container or Supabase not available');
        return;
    }
    
    // Show loading state
    container.innerHTML = '<div style="text-align: center; padding: 20px;"><p>Loading stories...</p></div>';
    
    // Load all stories for this category to get total count
    currentSupabase.getStories(category)
        .then(allStories => {
            const totalCount = allStories.length;
            const totalPages = Math.ceil(totalCount / storiesPerPage);
            
            // Calculate pagination
            const startIndex = (currentPage - 1) * storiesPerPage;
            const endIndex = startIndex + storiesPerPage;
            const stories = allStories.slice(startIndex, endIndex);
            
            if (allStories.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #6c757d;">No stories yet!</h3>
                        <p>Be the first to add a story to this category.</p>
                        <p style="color: #007bff;"><strong>Visit <a href="admin.html" style="text-decoration: none;">/admin</a> to add your first story</strong></p>
                    </div>
                `;
                hidePagination();
                return;
            }
            
            if (stories.length === 0 && totalPages > 0) {
                // Page doesn't exist, redirect to last available page
                window.location.href = updatePageInUrl(totalPages);
                return;
            }
            
            // Generate HTML for stories
            const storiesHTML = stories.map(story => `
                <div class="places">
                    ${story.image_url ? `<img src="${story.image_url}" alt="${escapeHtml(story.title)}" onerror="this.style.display='none'">` : ''}
                </div>
                <div class="story">
                    <h2>${escapeHtml(story.title)}</h2>
                    <p>${escapeHtml(story.story_content)}</p>
                    ${story.location ? `<p style="color: #007bff; font-style: italic;"><strong>📍 ${escapeHtml(story.location)}</strong></p>` : ''}
                    ${story.travel_date ? `<p style="color: #6c757d; font-size: 0.9em;">📅 ${story.travel_date}</p>` : ''}
                </div>
            `).join('');
            
            container.innerHTML = storiesHTML;
            
            // Update and show pagination
            updatePagination(totalPages, totalCount);
            
        })
        .catch(error => {
            console.error('Error loading stories:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; background: #f8d7da; border-radius: 8px; margin: 20px 0; color: #721c24;">
                    <p>Unable to load stories. Please check your connection and try again.</p>
                    <p style="font-size: 0.9em;">Error: ${error.message}</p>
                </div>
            `;
            hidePagination();
        });
}

function setupPagination() {
    // Create pagination container if it doesn't exist
    if (!document.getElementById('pagination-container')) {
        const container = document.getElementById('dynamic-stories-container');
        const paginationHTML = `
            <div id="pagination-container" style="text-align: center; margin: 30px 0; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: none;">
                <div id="page-info" style="margin-bottom: 15px; color: #6c757d; font-size: 0.9em;"></div>
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
    
    // Show pagination container
    container.style.display = 'block';
    
    // Generate pagination controls
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})" style="background: #007bff; color: white; border: none; padding: 8px 12px; margin: 0 5px; border-radius: 4px; cursor: pointer;">&laquo; Previous</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="changePage(1)" style="background: white; color: #007bff; border: 1px solid #007bff; padding: 8px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer;">1</button>`;
        if (startPage > 2) {
            paginationHTML += '<span style="margin: 0 5px; color: #6c757d;">...</span>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<button style="background: #007bff; color: white; border: 1px solid #007bff; padding: 8px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer;">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})" style="background: white; color: #007bff; border: 1px solid #007bff; padding: 8px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer;">${i}</button>`;
        }
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span style="margin: 0 5px; color: #6c757d;">...</span>';
        }
        paginationHTML += `<button onclick="changePage(${totalPages})" style="background: white; color: #007bff; border: 1px solid #007bff; padding: 8px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer;">${totalPages}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})" style="background: #007bff; color: white; border: none; padding: 8px 12px; margin: 0 5px; border-radius: 4px; cursor: pointer;">Next &raquo;</button>`;
    }
    
    controls.innerHTML = paginationHTML;
    
    // Update page info
    const startItem = (currentPage - 1) * storiesPerPage + 1;
    const endItem = Math.min(currentPage * storiesPerPage, totalCount);
    pageInfo.innerHTML = `Showing ${startItem}-${endItem} of ${totalCount} stories | Page ${currentPage} of ${totalPages}`;
}

function hidePagination() {
    const container = document.getElementById('pagination-container');
    if (container) {
        container.style.display = 'none';
    }
}

function changePage(newPage) {
    currentPage = newPage;
    // Update URL without page reload
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

// Export functions for use in HTML
window.loadCategoryStories = loadCategoryStories;
window.changePage = changePage;
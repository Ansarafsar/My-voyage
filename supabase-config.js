// Supabase Configuration
// Replace these values with your actual Supabase project details
const SUPABASE_CONFIG = {
    url: "https://dsrchxpktgkryqkryqok.supabase.co", 
    anonKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcmNoeHBrdGdrcnlxa3J5cW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDI2NDUsImV4cCI6MjA3NzA3ODY0NX0.pKdhZ0boPTFMchJbyzHkNeH0Jx04K3bnzJW2bElgQ4o, // Your anonymous/public key
    //serviceRoleKey: process.env.SUPA_SERVICEROLE_KEY 
    serviceRoleKey: null
};

// Simple Supabase client setup
class SupabaseClient {
    constructor(config) {
        this.url = config.url;
        this.anonKey = config.anonKey;
        this.serviceKey = config.serviceRoleKey;
    }

    // Make authenticated requests (for admin operations)
    async request(endpoint, options = {}) {
        const url = `${this.url}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'apikey': this.serviceKey,
            'Authorization': `Bearer ${this.serviceKey}`,
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('Supabase request failed:', error);
            throw error;
        }
    }

    // Make public requests (for reading data)
    async publicRequest(endpoint, options = {}) {
        const url = `${this.url}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'apikey': this.anonKey,
            'Authorization': `Bearer ${this.anonKey}`,
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('Supabase public request failed:', error);
            throw error;
        }
    }

    // Stories CRUD operations
    async getStories(category = null, limit = null, offset = null) {
        let endpoint = '/rest/v1/travel_stories?select=*&order=created_at.desc';
        if (category) {
            endpoint += `&category=eq.${category}`;
        }
        if (limit) {
            endpoint += `&limit=${limit}`;
        }
        if (offset) {
            endpoint += `&offset=${offset}`;
        }
        return this.publicRequest(endpoint);
    }

    async createStory(storyData) {
        return this.request('/rest/v1/travel_stories', {
            method: 'POST',
            body: JSON.stringify(storyData)
        });
    }

    async updateStory(id, storyData) {
        return this.request(`/rest/v1/travel_stories?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(storyData)
        });
    }

    async deleteStory(id) {
        return this.request(`/rest/v1/travel_stories?id=eq.${id}`, {
            method: 'DELETE'
        });
    }

    // Simple authentication check (optional)
    async validateCredentials(username, password) {
        // This is a simple demo - in production, use proper Supabase Auth
        // For now, we'll use a simple hardcoded check
        const validCredentials = {
            'admin': 'admin123' // Change this password!
        };
        
        return validCredentials[username] === password;
    }

    // Change password
    async changePassword(username, newPassword) {
        // In production, this would update the user in your auth system
        // For demo purposes, we'll just update a config
        console.log(`Password changed for user: ${username}`);
        return { success: true };
    }
}

// Create global Supabase client instance
let supabase;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if Supabase config is properly set
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL_HERE') {
        console.warn('Please configure Supabase settings in supabase-config.js');
        return;
    }
    
    supabase = new SupabaseClient(SUPABASE_CONFIG);
});

// Utility function to convert Google Drive URLs to direct image links
function convertGoogleDriveUrl(driveUrl) {
    if (!driveUrl) return '';
    
    // Handle different Google Drive URL formats
    if (driveUrl.includes('drive.google.com/file/d/')) {
        const fileId = driveUrl.match(/\/file\/d\/([^\/]+)/);
        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId[1]}`;
        }
    }
    
    if (driveUrl.includes('drive.google.com/open?id=')) {
        const fileId = driveUrl.match(/id=([^&]+)/);
        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId[1]}`;
        }
    }
    
    if (driveUrl.includes('drive.google.com/uc?id=')) {
        const fileId = driveUrl.match(/id=([^&]+)/);
        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId[1]}`;
        }
    }
    
    // If already in direct format, return as is
    if (driveUrl.includes('uc?export=view&id=')) {
        return driveUrl;
    }
    
    // Return original URL if no conversion possible
    return driveUrl;
}


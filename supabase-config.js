// Supabase Configuration
// Replace these values with your actual Supabase project details
const SUPABASE_CONFIG = {
    url: "https://dsrchxpktgkryqkryqok.supabase.co", 
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcmNoeXBrdGdrcnlxa3J5cW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDI2NDUsImV4cCI6MjA3NzA3ODY0NX0.pKdhZ0boPTFMchJbyzHkNeH0Jx04K3bnzJW2bElgQ4o",
    // Edge Function URL
    edgeFunctionUrl: "https://dsrchxpktgkryqkryqok.supabase.co/functions/v1/admin-stories"
};

// Simple Supabase client setup for public operations (reading data)
class SupabaseClient {
    constructor(config) {
        this.url = config.url;
        this.anonKey = config.anonKey;
        this.edgeFunctionUrl = config.edgeFunctionUrl;
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

    // Make requests to Edge Function (for admin operations)
    // In supabase-config.js, update the edgeFunctionRequest method

    async edgeFunctionRequest(action, data = {}, credentials = {}) {
        const url = this.edgeFunctionUrl;
        const headers = {
            'Content-Type': 'application/json',
        };

        const requestBody = {
            action,
            ...data
        };

        // Add credentials for all operations except getStories
        if (action !== 'getStories' && credentials.username && credentials.password) {
            requestBody.username = credentials.username;
            requestBody.password = credentials.password;
        }

        try {
            console.log('Sending request to Edge Function:', { 
                action, 
                hasCredentials: !!(credentials.username && credentials.password) || action === 'validateCredentials' 
            });
        
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json();
            console.log('Edge Function response:', { status: response.status, data: responseData });

            if (!response.ok) {
                throw new Error(responseData.error || `Request failed with status ${response.status}`);
            }

            return responseData;
        } catch (error) {
            console.error('Edge Function request failed:', error);
            throw error;
        }  
    }

    // Stories CRUD operations using Edge Function
    async getStories(category = null) {
        return this.edgeFunctionRequest('getStories', { category });
    }

    async createStory(storyData, credentials) {
        return this.edgeFunctionRequest('addStory', { data: storyData }, credentials);
    }

    async updateStory(id, storyData, credentials) {
        return this.edgeFunctionRequest('updateStory', { data: { id, ...storyData } }, credentials);
    }

    async deleteStory(id, credentials) {
        return this.edgeFunctionRequest('deleteStory', { data: { id } }, credentials);
    }

    // Simple authentication check (no hardcoded password)
    // Simple authentication check (no hardcoded password)
    async validateCredentials(username, password) {
        try {
            console.log('Validating credentials for username:', username);
            const response = await this.edgeFunctionRequest('validateCredentials', { username, password }, { username, password });
            console.log('Validation response:', response);
            return response.success;
        } catch (error) {
            console.error('Authentication failed:', error.message);
            return false;
        }
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
    console.log('Supabase client initialized');
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
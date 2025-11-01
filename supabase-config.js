// supabase-config.js
// Updated for single admin-stories function with image proxy

const SUPABASE_CONFIG = {
    url: "https://dsrchxpktgkryqkryqok.supabase.co", 
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcmNoeHBrdGdrcnlxa3J5cW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDI2NDUsImV4cCI6MjA3NzA3ODY0NX0.pKdhZ0boPTFMchJbyzHkNeH0Jx04K3bnzJW2bElgQ4o",
    edgeFunctionUrl: "https://dsrchxpktgkryqkryqok.supabase.co/functions/v1/admin-stories"
};

// === Supabase Client (unchanged) ===
class SupabaseClient {
    constructor(config) {
        this.url = config.url;
        this.anonKey = config.anonKey;
        this.edgeFunctionUrl = config.edgeFunctionUrl;
    }

    async publicRequest(endpoint, options = {}) {
        const url = `${this.url}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'apikey': this.anonKey,
            'Authorization': `Bearer ${this.anonKey}`,
            ...options.headers
        };
        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Request failed');
            return data;
        } catch (error) {
            console.error('Supabase public request failed:', error);
            throw error;
        }
    }

    async edgeFunctionRequest(action, data = {}, credentials = {}) {
        const url = this.edgeFunctionUrl;
        const headers = { 'Content-Type': 'application/json' };
        const requestBody = { action, ...data };
        if (action !== 'getStories' && credentials.username && credentials.password) {
            requestBody.username = credentials.username;
            requestBody.password = credentials.password;
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.error || `Request failed: ${response.status}`);
            return responseData;
        } catch (error) {
            console.error('Edge Function request failed:', error);
            throw error;
        }  
    }

    async getStories(category = null) { return this.edgeFunctionRequest('getStories', { category }); }
    async createStory(storyData, credentials) { return this.edgeFunctionRequest('addStory', { data: storyData }, credentials); }
    async updateStory(id, storyData, credentials) { return this.edgeFunctionRequest('updateStory', { data: { id, ...storyData } }, credentials); }
    async deleteStory(id, credentials) { return this.edgeFunctionRequest('deleteStory', { data: { id } }, credentials); }
    async validateCredentials(username, password) {
        try {
            const response = await this.edgeFunctionRequest('validateCredentials', { username, password }, { username, password });
            return response.success;
        } catch (error) {
            console.error('Authentication failed:', error.message);
            return false;
        }
    }
}

let supabase;
document.addEventListener('DOMContentLoaded', function() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL_HERE') {
        console.warn('Please configure Supabase settings');
        return;
    }
    supabase = new SupabaseClient(SUPABASE_CONFIG);
    console.log('Supabase client initialized');
});

// === IMAGE PROXY HELPER (NEW) ===
function extractFileId(driveUrl) {
    const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] || match[2] : null;
}

// Convert any Google Drive URL → proxy URL using admin-stories?id=...
function getProxyImageUrl(driveUrl) {
    if (!driveUrl) return '';
    const fileId = extractFileId(driveUrl);
    if (!fileId) return driveUrl;
    return `${SUPABASE_CONFIG.edgeFunctionUrl}?id=${fileId}`;
}

// For admin panel: convert share link → proxy URL
function convertGoogleDriveUrl(driveUrl) {
    if (!driveUrl) return '';
    const fileId = extractFileId(driveUrl);
    if (!fileId) return driveUrl;
    return getProxyImageUrl(driveUrl);
}

// Attach to supabase + window
supabase.getProxyImageUrl = getProxyImageUrl;
supabase.convertGoogleDriveUrl = convertGoogleDriveUrl;
window.getProxyImageUrl = getProxyImageUrl;
window.convertGoogleDriveUrl = convertGoogleDriveUrl;
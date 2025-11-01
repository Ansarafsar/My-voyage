// supabase-config.js
const SUPABASE_CONFIG = {
    url: "https://dsrchxpktgkryqkryqok.supabase.co", 
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcmNoeHBrdGdrcnlxa3J5cW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDI2NDUsImV4cCI6MjA3NzA3ODY0NX0.pKdhZ0boPTFMchJbyzHkNeH0Jx04K3bnzJW2bElgQ4o",
    edgeFunctionUrl: "https://dsrchxpktgkryqkryqok.supabase.co/functions/v1/admin-stories"
};

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

// === INITIALIZE IMMEDIATELY ===
let supabase = new SupabaseClient(SUPABASE_CONFIG);
console.log('Supabase client initialized');

// === PROXY HELPERS (GLOBAL & IMMEDIATE) ===
function extractFileId(driveUrl) {
    const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] || match[2] : null;
}

function getProxyImageUrl(driveUrl) {
    if (!driveUrl) return '';
    const fileId = extractFileId(driveUrl);
    if (!fileId) return driveUrl;
    return `${SUPABASE_CONFIG.edgeFunctionUrl}?id=${fileId}`;
}

function convertGoogleDriveUrl(driveUrl) {
    if (!driveUrl) return '';
    const fileId = extractFileId(driveUrl);
    if (!fileId) return driveUrl;
    return getProxyImageUrl(driveUrl);
}

supabase.getProxyImageUrl = getProxyImageUrl;
supabase.convertGoogleDriveUrl = convertGoogleDriveUrl;
window.getProxyImageUrl = getProxyImageUrl;
window.convertGoogleDriveUrl = convertGoogleDriveUrl;

// Optional: log when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, proxy ready');
});
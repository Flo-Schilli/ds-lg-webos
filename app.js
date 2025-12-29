/**
 * Digital Signage LG WebOS Application
 * This application forwards to a hosted SPA with device identifier and UUID parameters
 */

// Configuration - IMPORTANT: Replace with your actual SPA URL before deployment
// This is the primary configuration point for the application
const SPA_URL = 'http://localhost:5173';

/**
 * Generate or retrieve a persistent UUID for this device
 * The UUID is stored in localStorage and reused on subsequent launches
 */
function getOrCreateUUID() {
    const STORAGE_KEY = 'device_uuid';
    let uuid = localStorage.getItem(STORAGE_KEY);
    
    if (!uuid) {
        // Generate a new UUID v4
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        
        localStorage.setItem(STORAGE_KEY, uuid);
        console.log('Generated new UUID:', uuid);
    } else {
        console.log('Retrieved existing UUID:', uuid);
    }
    
    return uuid;
}

/**
 * Get the device identifier from LG WebOS API
 */
function getDeviceIdentifier(callback) {
    try {
        if (typeof webOS !== 'undefined' && webOS.deviceInfo) {
            // Try to get device information
            webOS.deviceInfo(function(device) {
                console.log('Device info:', device);
                
                // Try to get the device ID (may vary based on WebOS version)
                // Priority: modelName > serialNumber > sdkVersion
                let deviceId = device.modelName || device.serialNumber || device.sdkVersion || 'unknown';
                
                callback(deviceId);
            }, function(error) {
                console.error('Error getting device info:', error);
                callback('webos-device-' + Date.now());
            });
        } else {
            // Fallback if WebOS API is not available
            console.warn('WebOS API not available, using fallback');
            callback('webos-device-' + Date.now());
        }
    } catch (error) {
        console.error('Exception getting device identifier:', error);
        callback('webos-device-' + Date.now());
    }
}

/**
 * Build the target URL with parameters
 */
function buildTargetUrl(deviceId, uuid) {
    const url = new URL(SPA_URL);
    url.searchParams.append('deviceId', deviceId);
    url.searchParams.append('uuid', uuid);
    
    console.log('Target URL:', url.toString());
    return url.toString();
}

/**
 * Load the SPA in an iframe
 */
function loadSPA(targetUrl) {
    const iframe = document.getElementById('contentFrame');
    const loadingMessage = document.getElementById('loadingMessage');
    
    iframe.src = targetUrl;
    
    // Show iframe and hide loading message once loaded
    iframe.onload = function() {
        loadingMessage.style.display = 'none';
        iframe.style.display = 'block';
        console.log('SPA loaded successfully');
    };
    
    // Handle loading errors
    iframe.onerror = function() {
        loadingMessage.textContent = 'Error loading content. Please check your connection.';
        console.error('Error loading SPA');
    };
}

/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing Digital Signage application...');
    
    // Get or create the persistent UUID
    const uuid = getOrCreateUUID();
    
    // Get the device identifier
    getDeviceIdentifier(function(deviceId) {
        console.log('Device ID:', deviceId);
        
        // Build the target URL with parameters
        const targetUrl = buildTargetUrl(deviceId, uuid);
        
        // Load the SPA
        loadSPA(targetUrl);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

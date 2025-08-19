// Background service worker for Pinterest Aspect Ratio Filter

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    // Set default settings on first install
    chrome.storage.sync.get(['allowedRatios'], (result) => {
        if (!result.allowedRatios) {
            chrome.storage.sync.set({
                filterMode: 'hide',
                allowedRatios: [],
                customRatios: [],
                tolerance: 5,
                filterActive: true
            });
        }
    });
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('pinterest.com')) {
        // Content script should auto-inject based on manifest, but this ensures it's loaded
        chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
            if (chrome.runtime.lastError) {
                // Content script not loaded, inject it
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                });
                chrome.scripting.insertCSS({
                    target: { tabId: tabId },
                    files: ['content.css']
                });
            }
        });
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.sync.get({
            filterMode: 'hide',
            allowedRatios: [],
            customRatios: [],
            tolerance: 5,
            filterActive: true
        }, (settings) => {
            sendResponse(settings);
        });
        return true; // Keep message channel open for async response
    }
});
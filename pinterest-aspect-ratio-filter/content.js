// Pinterest Aspect Ratio Filter Content Script

let settings = {
    filterMode: 'hide',
    allowedRatios: [],
    tolerance: 5,
    filterActive: true
};

let processedImages = new WeakSet();
let observer = null;

// Initialize
(async function init() {
    // Load settings
    await loadSettings();
    
    // Start filtering if active
    if (settings.filterActive) {
        startFiltering();
    }

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateSettings') {
            settings = request.settings;
            applyFilters();
        } else if (request.action === 'toggleFilter') {
            settings.filterActive = request.active;
            if (settings.filterActive) {
                startFiltering();
            } else {
                stopFiltering();
            }
        }
    });
})();

// Load settings from storage
async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({
            filterMode: 'hide',
            allowedRatios: [],
            tolerance: 5,
            filterActive: true
        }, (result) => {
            settings = result;
            resolve();
        });
    });
}

// Start filtering
function startFiltering() {
    // Initial filter application
    applyFilters();
    
    // Setup mutation observer for dynamic content
    if (!observer) {
        observer = new MutationObserver((mutations) => {
            let hasNewImages = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'IMG' || node.querySelector('img')) {
                                hasNewImages = true;
                            }
                        }
                    });
                }
            });
            
            if (hasNewImages) {
                setTimeout(applyFilters, 100); // Small delay to ensure images are loaded
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Stop filtering
function stopFiltering() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    removeAllFilters();
}

// Apply filters to all images
function applyFilters() {
    if (!settings.filterActive) return;
    
    // Find all Pinterest images
    const images = findPinterestImages();
    
    images.forEach(img => {
        filterImage(img);
    });
}

// Find Pinterest images
function findPinterestImages() {
    const images = [];
    
    // Standard image tags
    document.querySelectorAll('img').forEach(img => {
        if (isPinterestImage(img)) {
            images.push(img);
        }
    });
    
    // Background images in divs (Pinterest often uses these)
    document.querySelectorAll('[style*="background-image"]').forEach(elem => {
        const bgImage = elem.style.backgroundImage;
        if (bgImage && bgImage.includes('pinimg.com')) {
            images.push(elem);
        }
    });
    
    // Pinterest specific image containers
    document.querySelectorAll('[data-test-id*="pin"], [data-test-id*="image"], .GrowthUnauthPinImage, [role="img"]').forEach(elem => {
        const img = elem.querySelector('img') || elem;
        if (img && !images.includes(img)) {
            images.push(img);
        }
    });
    
    return images;
}

// Check if element is a Pinterest image
function isPinterestImage(elem) {
    if (!elem) return false;
    
    // Check src for img tags
    if (elem.tagName === 'IMG' && elem.src) {
        return elem.src.includes('pinimg.com') || 
               elem.src.includes('pinterest') ||
               elem.closest('[data-test-id*="pin"]') !== null;
    }
    
    // Check background image for divs
    if (elem.style.backgroundImage) {
        return elem.style.backgroundImage.includes('pinimg.com');
    }
    
    return false;
}

// Filter individual image
function filterImage(element) {
    // Skip if already processed recently
    if (processedImages.has(element)) {
        return;
    }
    
    // Get image dimensions
    const dimensions = getImageDimensions(element);
    if (!dimensions || dimensions.width === 0 || dimensions.height === 0) {
        // Try again later if dimensions not available
        setTimeout(() => {
            processedImages.delete(element);
            filterImage(element);
        }, 500);
        return;
    }
    
    // Calculate aspect ratio
    const aspectRatio = dimensions.width / dimensions.height;
    
    // Check if ratio is allowed
    const isAllowed = isRatioAllowed(aspectRatio);
    
    // Apply or remove filter based on result
    if (!isAllowed) {
        applyFilterToElement(element);
    } else {
        removeFilterFromElement(element);
    }
    
    // Mark as processed
    processedImages.add(element);
}

// Get image dimensions
function getImageDimensions(element) {
    if (element.tagName === 'IMG') {
        // For img tags, use natural dimensions if available
        if (element.naturalWidth && element.naturalHeight) {
            return {
                width: element.naturalWidth,
                height: element.naturalHeight
            };
        } else if (element.width && element.height) {
            return {
                width: element.width,
                height: element.height
            };
        }
    }
    
    // For background images or when natural dimensions aren't available
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
        return {
            width: rect.width,
            height: rect.height
        };
    }
    
    return null;
}

// Check if aspect ratio is allowed
function isRatioAllowed(ratio) {
    if (settings.allowedRatios.length === 0) {
        return true; // If no ratios selected, allow all
    }
    
    const tolerance = settings.tolerance / 100;
    
    return settings.allowedRatios.some(allowedRatio => {
        const minRatio = allowedRatio * (1 - tolerance);
        const maxRatio = allowedRatio * (1 + tolerance);
        return ratio >= minRatio && ratio <= maxRatio;
    });
}

// Apply filter to element
function applyFilterToElement(element) {
    // Find the container to apply filter to
    const container = findImageContainer(element);
    const target = container || element;
    
    // Remove any existing filter classes
    target.classList.remove('parf-hide', 'parf-blur', 'parf-dim');
    
    // Apply new filter based on mode
    switch (settings.filterMode) {
        case 'hide':
            target.classList.add('parf-hide');
            break;
        case 'blur':
            target.classList.add('parf-blur');
            break;
        case 'dim':
            target.classList.add('parf-dim');
            break;
    }
    
    target.setAttribute('data-parf-filtered', 'true');
}

// Remove filter from element
function removeFilterFromElement(element) {
    const container = findImageContainer(element);
    const target = container || element;
    
    target.classList.remove('parf-hide', 'parf-blur', 'parf-dim');
    target.removeAttribute('data-parf-filtered');
}

// Find the appropriate container for an image
function findImageContainer(element) {
    // Look for Pinterest pin containers
    const pinContainer = element.closest('[data-test-id*="pin"], [data-grid-item], .GrowthUnauthPinContainer');
    if (pinContainer) {
        return pinContainer;
    }
    
    // Look for general image containers
    const imageContainer = element.closest('[role="img"], .imgContainer, .imageWrapper');
    if (imageContainer) {
        return imageContainer;
    }
    
    // Look for link containers (pins are often wrapped in links)
    const linkContainer = element.closest('a[href*="/pin/"]');
    if (linkContainer) {
        return linkContainer;
    }
    
    return null;
}

// Remove all filters
function removeAllFilters() {
    document.querySelectorAll('[data-parf-filtered]').forEach(element => {
        element.classList.remove('parf-hide', 'parf-blur', 'parf-dim');
        element.removeAttribute('data-parf-filtered');
    });
    processedImages = new WeakSet();
}

// Reprocess images when window resizes (dimensions might change)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        processedImages = new WeakSet();
        applyFilters();
    }, 500);
});

// Reprocess when images load
window.addEventListener('load', () => {
    setTimeout(applyFilters, 1000);
});
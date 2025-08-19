// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    setupEventListeners();
});

// Load saved settings
async function loadSettings() {
    const settings = await chrome.storage.sync.get({
        filterMode: 'hide',
        allowedRatios: [],
        customRatios: [],
        tolerance: 5,
        filterActive: true
    });

    // Set filter mode
    document.querySelector(`input[name="filterMode"][value="${settings.filterMode}"]`).checked = true;

    // Set allowed ratios
    settings.allowedRatios.forEach(ratio => {
        const checkbox = document.querySelector(`input[data-value="${ratio}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    // Set custom ratios
    displayCustomRatios(settings.customRatios);

    // Set tolerance
    document.getElementById('tolerance').value = settings.tolerance;
    document.getElementById('toleranceValue').textContent = `${settings.tolerance}%`;

    // Set filter active state
    updateToggleButton(settings.filterActive);
}

// Setup event listeners
function setupEventListeners() {
    // Filter mode changes
    document.querySelectorAll('input[name="filterMode"]').forEach(radio => {
        radio.addEventListener('change', saveAndApplySettings);
    });

    // Ratio checkbox changes
    document.querySelectorAll('.ratio-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', saveAndApplySettings);
    });

    // Tolerance slider
    document.getElementById('tolerance').addEventListener('input', (e) => {
        document.getElementById('toleranceValue').textContent = `${e.target.value}%`;
    });
    document.getElementById('tolerance').addEventListener('change', saveAndApplySettings);

    // Custom ratio
    document.getElementById('addCustom').addEventListener('click', addCustomRatio);
    document.getElementById('customWidth').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCustomRatio();
    });
    document.getElementById('customHeight').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCustomRatio();
    });

    // Toggle filter
    document.getElementById('toggleFilter').addEventListener('click', toggleFilter);

    // Save settings button
    document.getElementById('saveSettings').addEventListener('click', saveAndApplySettings);
}

// Add custom ratio
function addCustomRatio() {
    const width = parseInt(document.getElementById('customWidth').value);
    const height = parseInt(document.getElementById('customHeight').value);

    if (!width || !height || width <= 0 || height <= 0) {
        showStatus('Please enter valid width and height values', 'error');
        return;
    }

    const ratio = width / height;
    const ratioString = `${width}:${height}`;

    chrome.storage.sync.get(['customRatios'], (result) => {
        const customRatios = result.customRatios || [];
        
        // Check if ratio already exists
        if (customRatios.some(r => r.string === ratioString)) {
            showStatus('This ratio already exists', 'error');
            return;
        }

        customRatios.push({ string: ratioString, value: ratio });
        
        chrome.storage.sync.set({ customRatios }, () => {
            displayCustomRatios(customRatios);
            document.getElementById('customWidth').value = '';
            document.getElementById('customHeight').value = '';
            saveAndApplySettings();
            showStatus('Custom ratio added', 'success');
        });
    });
}

// Display custom ratios
function displayCustomRatios(customRatios) {
    const container = document.getElementById('customRatiosList');
    container.innerHTML = '';

    customRatios.forEach((ratio, index) => {
        const div = document.createElement('div');
        div.className = 'custom-ratio-item';
        div.innerHTML = `
            <label class="ratio-option">
                <input type="checkbox" data-custom="true" data-value="${ratio.value}" checked>
                <span>${ratio.string}</span>
            </label>
            <button class="remove-btn" data-index="${index}">×</button>
        `;
        container.appendChild(div);

        // Add event listeners
        div.querySelector('input[type="checkbox"]').addEventListener('change', saveAndApplySettings);
        div.querySelector('.remove-btn').addEventListener('click', () => removeCustomRatio(index));
    });
}

// Remove custom ratio
function removeCustomRatio(index) {
    chrome.storage.sync.get(['customRatios'], (result) => {
        const customRatios = result.customRatios || [];
        customRatios.splice(index, 1);
        
        chrome.storage.sync.set({ customRatios }, () => {
            displayCustomRatios(customRatios);
            saveAndApplySettings();
            showStatus('Custom ratio removed', 'success');
        });
    });
}

// Toggle filter on/off
async function toggleFilter() {
    const button = document.getElementById('toggleFilter');
    const isActive = button.classList.contains('active');
    const newState = !isActive;

    await chrome.storage.sync.set({ filterActive: newState });
    updateToggleButton(newState);
    
    // Send message to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('pinterest.com')) {
        chrome.tabs.sendMessage(tab.id, { 
            action: 'toggleFilter', 
            active: newState 
        });
    }

    showStatus(newState ? 'Filter activated' : 'Filter deactivated', 'success');
}

// Update toggle button appearance
function updateToggleButton(isActive) {
    const button = document.getElementById('toggleFilter');
    if (isActive) {
        button.classList.add('active');
        button.textContent = 'Filter Active';
    } else {
        button.classList.remove('active');
        button.textContent = 'Filter Inactive';
    }
}

// Save and apply settings
async function saveAndApplySettings() {
    const filterMode = document.querySelector('input[name="filterMode"]:checked').value;
    const tolerance = parseInt(document.getElementById('tolerance').value);
    
    // Get all checked ratios
    const allowedRatios = [];
    document.querySelectorAll('.ratio-option input[type="checkbox"]:checked').forEach(checkbox => {
        allowedRatios.push(parseFloat(checkbox.dataset.value));
    });

    // Get filter active state
    const filterActive = document.getElementById('toggleFilter').classList.contains('active');

    // Save to storage
    await chrome.storage.sync.set({
        filterMode,
        allowedRatios,
        tolerance,
        filterActive
    });

    // Apply to current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('pinterest.com')) {
        chrome.tabs.sendMessage(tab.id, { 
            action: 'updateSettings',
            settings: {
                filterMode,
                allowedRatios,
                tolerance,
                filterActive
            }
        });
    }

    showStatus('Settings saved', 'success');
}

// Show status message
function showStatus(message, type = 'success') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';

    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}
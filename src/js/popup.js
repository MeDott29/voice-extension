class VoiceAssistant {
  constructor() {
    this.isListening = false;
    this.currentTabId = null;
    
    // UI elements
    this.toggleButton = document.getElementById('toggleVoice');
    this.transcriptionDiv = document.getElementById('transcription');
    this.responseDiv = document.getElementById('response');
    this.statusIndicator = document.getElementById('status-indicator');
    this.statusText = document.getElementById('status-text');
    this.errorMessage = document.getElementById('error-message');
    
    // Disable button until initialization is complete
    this.toggleButton.disabled = true;
    this.init();
  }
  
  async init() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTabId = tab.id;
      
      // Check if we're on a restricted URL
      if (this.isRestrictedUrl(tab.url)) {
        this.handleError('Restricted URL', new Error('This extension cannot be used on this page'));
        this.toggleButton.disabled = true;
        return; // Exit early for restricted URLs
      }
      
      // Add event listeners
      this.toggleButton.addEventListener('click', () => this.toggleVoice());
      
      // Check if content script is ready
      await this.checkContentScript();
      
      // Enable button and update status
      this.toggleButton.disabled = false;
      this.updateStatus('ready', 'Ready');
    } catch (error) {
      this.handleError('Initialization error', error);
      this.toggleButton.disabled = true;
    }
  }
  
  async checkContentScript() {
    try {
      // Send ping to content script
      const response = await chrome.tabs.sendMessage(this.currentTabId, { type: 'PING' });
      if (!response || !response.success) {
        throw new Error('Content script not ready');
      }
    } catch (error) {
      throw new Error('Failed to connect to content script. Please refresh the page and try again.');
    }
  }
  
  updateStatus(status, message) {
    const colors = {
      ready: '#4CAF50',
      listening: '#2196F3',
      processing: '#FFC107',
      error: '#F44336'
    };
    this.statusIndicator.style.backgroundColor = colors[status] || colors.error;
    this.statusText.textContent = message || status;
  }
  
  handleError(context, error) {
    console.error(`${context}:`, error);
    const errorMessage = error.message || 'An error occurred';
    this.errorMessage.textContent = errorMessage;
    this.errorMessage.classList.remove('hidden');
    this.updateStatus('error', 'Error');
    
    setTimeout(() => {
      this.errorMessage.classList.add('hidden');
      if (this.statusText.textContent === 'Error') {
        this.updateStatus('ready', 'Ready');
      }
    }, 5000);
  }
  
  async toggleVoice() {
    if (!this.isListening) {
      try {
        // Check content script connection before proceeding
        await this.checkContentScript();
        
        const response = await chrome.tabs.sendMessage(this.currentTabId, { 
          type: 'START_RECORDING' 
        });
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to start recording');
        }
        
        this.isListening = true;
        this.toggleButton.textContent = 'Stop Voice';
        this.updateStatus('listening', 'Listening...');
      } catch (error) {
        this.handleError('Error starting recording', error);
      }
    } else {
      try {
        await chrome.tabs.sendMessage(this.currentTabId, { 
          type: 'STOP_RECORDING' 
        });
        
        this.isListening = false;
        this.toggleButton.textContent = 'Start Voice';
        this.updateStatus('ready', 'Ready');
      } catch (error) {
        this.handleError('Error stopping recording', error);
      }
    }
  }

  isRestrictedUrl(url) {
    const restrictedPatterns = [
      'chrome://',
      'chrome-extension://',
      'https://chrome.google.com/webstore/',
      'edge://',
      'about:',
      'file://'
    ];
    return restrictedPatterns.some(pattern => url.startsWith(pattern));
  }
}

// Initialize when popup loads
document.addEventListener('DOMContentLoaded', () => {
  new VoiceAssistant();
});

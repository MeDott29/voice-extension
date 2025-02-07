class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }
  
  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start(1000);
      return { success: true };
    } catch (error) {
      console.error('Error starting recording:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to start recording' 
      };
    }
  }
  
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    return { success: true };
  }
}

// Create audio recorder instance
const recorder = new AudioRecorder();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Respond to ping
  if (request.type === 'PING') {
    sendResponse({ success: true });
    return;
  }
  
  // Handle recording commands
  if (request.type === 'START_RECORDING') {
    recorder.startRecording().then(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (request.type === 'STOP_RECORDING') {
    const response = recorder.stopRecording();
    sendResponse(response);
    return false;
  }
});

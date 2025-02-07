chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Inject the content script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['js/content.js']
    });
  }
});

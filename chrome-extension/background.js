// background.js
// Handles API requests to avoid CORS issues on some pages and caches results

// Set initial badge state on load
chrome.storage.local.get(['isActive'], (result) => {
  const isActive = result.isActive !== false; // default to true
  chrome.action.setBadgeText({ text: isActive ? 'ON' : 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: isActive ? '#10b981' : '#64748b' });
  if (result.isActive === undefined) {
    chrome.storage.local.set({ isActive: true });
  }
});

// Handle icon click (Toggle ON/OFF)
chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get(['isActive'], (result) => {
    const newState = result.isActive === false ? true : false;
    chrome.storage.local.set({ isActive: newState });
    
    // Update the badge to act as a "glow" indicator
    chrome.action.setBadgeText({ text: newState ? 'ON' : 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: newState ? '#10b981' : '#64748b' });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchMeaning') {
    const word = request.word.toLowerCase();
    
    // Check cache first
    chrome.storage.local.get([word], (result) => {
      if (result[word]) {
        sendResponse({ success: true, data: result[word] });
      } else {
        // Fetch from Free Dictionary API and Google Translate API
        Promise.all([
          fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`).then(res => {
            if (!res.ok) throw new Error('Word not found');
            return res.json();
          }),
          fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(word)}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null) // fail silently for translation
        ])
        .then(([dictData, transData]) => {
          const hindiMeaning = transData && transData[0] && transData[0][0] && transData[0][0][0] ? transData[0][0][0] : '';
          const combinedData = {
            ...dictData[0],
            hindiMeaning
          };
          
          // Cache the successful result
          chrome.storage.local.set({ [word]: combinedData });
          sendResponse({ success: true, data: combinedData });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      }
    });
    
    // Return true to indicate we will send a response asynchronously
    return true; 
  }
});

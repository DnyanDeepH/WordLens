// content.js
// Detects text selection and renders the tooltip

console.log("WordLens extension loaded on this page.");

let tooltip = null;
let hideTimeout = null;
let isActive = true;

// Load initial state
chrome.storage.local.get(['isActive'], (result) => {
  if (result.isActive !== undefined) {
    isActive = result.isActive;
  }
});

// Listen for state changes from the background script (when user clicks the icon)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.isActive !== undefined) {
    isActive = changes.isActive.newValue;
    console.log("WordLens is now", isActive ? "ON" : "OFF");
    if (!isActive) hideTooltip();
  }
});

function createTooltip() {
  if (tooltip) return;
  tooltip = document.createElement('div');
  tooltip.id = 'quick-dict-tooltip';
  document.body.appendChild(tooltip);
  
  // Prevent hiding when clicking inside the tooltip itself
  tooltip.addEventListener('mousedown', (e) => e.stopPropagation());
}

function hideTooltip() {
  if (tooltip) {
    tooltip.classList.remove('quick-dict-show');
    hideTimeout = setTimeout(() => {
      if (tooltip && !tooltip.classList.contains('quick-dict-show')) {
        tooltip.style.display = 'none';
      }
    }, 200); // match CSS transition
  }
}

// Hide tooltip when clicking elsewhere
document.addEventListener('mousedown', (e) => {
  if (tooltip && !tooltip.contains(e.target)) {
    hideTooltip();
  }
});

// Listen for text selection
document.addEventListener('mouseup', (e) => {
  if (!isActive) return; // Do nothing if extension is toggled off

  // Debounce to allow selection to complete
  setTimeout(() => {
    const selection = window.getSelection();
    if (!selection) return;
    
    let text = selection.toString().trim();
    
    // Strip punctuation from the beginning and end of the selection (e.g. "word," -> "word")
    text = text.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '');
    
    console.log("WordLens Selected:", text); // Debug log to see what is being captured
    
    // Validate selection: 1-30 chars, mostly alphabetic
    if (text && text.length > 1 && text.length < 30 && /^[a-zA-Z\s-]+$/.test(text)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Don't show if clicking inside the tooltip
      if (tooltip && tooltip.contains(e.target)) return;
      
      showLoading(rect);
      
      // Send message to background script to fetch data
      chrome.runtime.sendMessage({ action: 'fetchMeaning', word: text }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("WordLens Error:", chrome.runtime.lastError);
          renderError(text, rect);
          return;
        }

        if (response && response.success) {
          // background.js now returns the combined object directly, not an array
          renderTooltip(response.data, rect);
        } else {
          renderError(text, rect);
        }
      });
    }
  }, 10);
});

function positionTooltip(rect) {
  createTooltip();
  tooltip.style.display = 'block';
  
  const tooltipRect = tooltip.getBoundingClientRect();
  const margin = 10;
  
  // Calculate horizontal position (centered on selection)
  let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);
  
  // Horizontal bounds checking
  const maxLeft = document.documentElement.clientWidth - tooltipRect.width - margin;
  if (left > maxLeft) left = maxLeft;
  if (left < margin) left = margin;
  
  // Calculate vertical position
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  
  let top;
  
  // Prefer below, but if it doesn't fit and there's more space above, put it above
  if (spaceBelow < tooltipRect.height + margin && spaceAbove > spaceBelow) {
    top = rect.top + window.scrollY - tooltipRect.height - margin;
  } else {
    top = rect.bottom + window.scrollY + margin;
  }
  
  // Final vertical bounds check to ensure it doesn't go off the top of the document
  if (top < window.scrollY + margin) {
    top = window.scrollY + margin;
  }
  
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  
  // Trigger reflow for animation
  void tooltip.offsetWidth;
  tooltip.classList.add('quick-dict-show');
}

function showLoading(rect) {
  createTooltip();
  tooltip.innerHTML = `<div class="quick-dict-loader"></div>`;
  positionTooltip(rect);
}

function renderTooltip(data, rect) {
  const word = data.word;
  // Find phonetic text if available
  const phonetic = data.phonetic || (data.phonetics && data.phonetics.find(p => p.text)?.text) || '';
  
  // Get first meaning
  const meaning = data.meanings && data.meanings[0] ? data.meanings[0] : null;
  const partOfSpeech = meaning ? meaning.partOfSpeech : '';
  const definition = meaning && meaning.definitions[0] ? meaning.definitions[0].definition : '';
  
  // Find an example sentence
  let example = '';
  if (data.meanings) {
    for (const m of data.meanings) {
      for (const d of m.definitions) {
        if (d.example) {
          example = d.example;
          break;
        }
      }
      if (example) break;
    }
  }
  
  // Get synonyms if available (aggregate from all meanings and definitions)
  let allSynonyms = [];
  if (data.meanings) {
    data.meanings.forEach(m => {
      if (m.synonyms) allSynonyms.push(...m.synonyms);
      if (m.definitions) {
        m.definitions.forEach(d => {
          if (d.synonyms) allSynonyms.push(...d.synonyms);
        });
      }
    });
  }
  // Remove duplicates and limit to 5
  allSynonyms = [...new Set(allSynonyms)].slice(0, 5);
  
  const synonymsHtml = allSynonyms.length > 0 
    ? `<div class="quick-dict-synonyms-section">
         <div class="quick-dict-synonyms-title">Synonyms</div>
         <div class="quick-dict-synonyms-list">
           ${allSynonyms.map(s => `<span class="quick-dict-synonym-tag">${s}</span>`).join('')}
         </div>
       </div>` 
    : '';

  const hindiHtml = data.hindiMeaning ? `<div class="quick-dict-hindi">${data.hindiMeaning}</div>` : '';
  const exampleHtml = example ? `<div class="quick-dict-example">"${example}"</div>` : '';

  tooltip.innerHTML = `
    <div class="quick-dict-header">
      <span class="quick-dict-word">${word}</span>
      <span class="quick-dict-phonetic">${phonetic}</span>
    </div>
    ${hindiHtml}
    <div class="quick-dict-pos">${partOfSpeech}</div>
    <div class="quick-dict-def">${definition}</div>
    ${exampleHtml}
    ${synonymsHtml}
  `;
  positionTooltip(rect);
}

function renderError(word, rect) {
  tooltip.innerHTML = `
    <div class="quick-dict-error">No definition found for "${word}".</div>
  `;
  positionTooltip(rect);
  
  // Auto-hide error after 3 seconds
  setTimeout(() => {
    hideTooltip();
  }, 3000);
}

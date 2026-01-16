// Content script to detect and expand text shortcuts

let macros = [];
let isExpanding = false;
let settings = { autoExpand: true, enableNotifications: false };
let expansionHistory = []; // For undo functionality
const MAX_HISTORY = 10;

// Load macros and settings from storage
async function loadMacros() {
  try {
    const result = await chrome.storage.sync.get(['macros', 'settings']);
    macros = result.macros || [];
    settings = result.settings || { autoExpand: true, enableNotifications: false };
    console.log('Fountain - Macro Assistant: Loaded', macros.length, 'macros');
    if (macros.length > 0) {
      console.log('Fountain - Macro Assistant: Macros:', macros.map(m => m.shortcut));
    }
  } catch (error) {
    console.error('Fountain - Macro Assistant: Error loading macros:', error);
  }
}

// Initialize - ensure macros are loaded before page interaction
(async () => {
  await loadMacros();
  console.log('Fountain - Macro Assistant: Extension initialized and ready');
})();

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    if (changes.macros) {
      macros = changes.macros.newValue || [];
    }
    if (changes.settings) {
      settings = changes.settings.newValue || { autoExpand: true, enableNotifications: false };
    }
  }
});

// Process macro variables in expansion text
function processMacroVariables(text) {
  if (!text) return text;
  
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();
  const datetime = now.toLocaleString();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  // Get clipboard content (async, will be handled separately)
  let clipboardText = '';
  
  return text
    .replace(/\{date\}/g, date)
    .replace(/\{time\}/g, time)
    .replace(/\{datetime\}/g, datetime)
    .replace(/\{year\}/g, year)
    .replace(/\{month\}/g, month)
    .replace(/\{day\}/g, day)
    .replace(/\{hour\}/g, hour)
    .replace(/\{minute\}/g, minute)
    .replace(/\{second\}/g, second)
    .replace(/\{timestamp\}/g, now.getTime().toString())
    .replace(/\{newline\}/g, '\n')
    .replace(/\{tab\}/g, '\t');
}

// Process clipboard variable (async)
async function processClipboardVariable(text) {
  if (!text.includes('{clipboard}')) return text;
  
  try {
    const clipboardText = await navigator.clipboard.readText();
    return text.replace(/\{clipboard\}/g, clipboardText);
  } catch (error) {
    console.warn('Fountain - Macro Assistant: Could not read clipboard:', error);
    return text.replace(/\{clipboard\}/g, '');
  }
}

// Show notification
function showNotification(message) {
  // Create a simple notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4285f4;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 2000);
}

// Show undo notification
function showUndoNotification(undoState) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 14px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10001;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideInUp 0.3s ease-out;
    cursor: pointer;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideOutDown {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  notification.innerHTML = `
    <span>Expanded: ${undoState.shortcut}</span>
    <button style="
      background: rgba(255,255,255,0.3);
      border: 1px solid rgba(255,255,255,0.5);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
    ">Undo</button>
  `;
  
  const undoBtn = notification.querySelector('button');
  undoBtn.addEventListener('click', () => {
    undoExpansion(undoState);
    notification.style.animation = 'slideOutDown 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  });
  
  document.body.appendChild(notification);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutDown 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 300);
    }
  }, 5000);
}

// Undo expansion
function undoExpansion(undoState) {
  const element = undoState.element;
  
  if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
    element.value = undoState.oldValue;
    element.selectionStart = element.selectionEnd = undoState.oldValue.length;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (element.isContentEditable || element.contentEditable === 'true') {
    element.textContent = undoState.oldValue;
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  // Remove from history
  const index = expansionHistory.indexOf(undoState);
  if (index > -1) {
    expansionHistory.splice(index, 1);
  }
}

// Check if macro conditions are met
function checkConditions(conditions) {
  if (!conditions || Object.keys(conditions).length === 0) {
    return true; // No conditions = always true
  }
  
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Time-based conditions
  if (conditions.timeRange) {
    const { start, end } = conditions.timeRange;
    if (start !== undefined && end !== undefined) {
      if (start > end) {
        // Handles overnight ranges (e.g., 22:00 to 06:00)
        if (hour < start && hour >= end) {
          return false;
        }
      } else {
        if (hour < start || hour >= end) {
          return false;
        }
      }
    }
  }
  
  // Day-based conditions
  if (conditions.days) {
    if (Array.isArray(conditions.days) && conditions.days.length > 0) {
      if (!conditions.days.includes(day)) {
        return false;
      }
    }
  }
  
  // Weekday/Weekend conditions
  if (conditions.weekdayOnly !== undefined) {
    const isWeekday = day >= 1 && day <= 5; // Monday to Friday
    if (conditions.weekdayOnly && !isWeekday) {
      return false;
    }
    if (!conditions.weekdayOnly && isWeekday) {
      return false;
    }
  }
  
  return true;
}

// Get conditional expansion based on current conditions
function getConditionalExpansion(macro, defaultExpansion) {
  const conditions = macro.conditions || {};
  
  if (!conditions.expansions || !Array.isArray(conditions.expansions) || conditions.expansions.length === 0) {
    return defaultExpansion;
  }
  
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  // Find matching conditional expansion
  for (const condExp of conditions.expansions) {
    let matches = true;
    
    // Check time range
    if (condExp.timeRange) {
      const { start, end } = condExp.timeRange;
      if (start !== undefined && end !== undefined) {
        if (start > end) {
          if (hour < start && hour >= end) {
            matches = false;
          }
        } else {
          if (hour < start || hour >= end) {
            matches = false;
          }
        }
      }
    }
    
    // Check day
    if (condExp.day !== undefined && condExp.day !== day) {
      matches = false;
    }
    
    // Check weekday/weekend
    if (condExp.weekdayOnly !== undefined) {
      const isWeekday = day >= 1 && day <= 5;
      if (condExp.weekdayOnly && !isWeekday) {
        matches = false;
      }
      if (!condExp.weekdayOnly && isWeekday) {
        matches = false;
      }
    }
    
    if (matches && condExp.expansion) {
      return condExp.expansion;
    }
  }
  
  return defaultExpansion;
}

// Update usage statistics
async function updateUsageStats(macroId) {
  try {
    const result = await chrome.storage.sync.get(['macroStats']);
    const stats = result.macroStats || {};
    
    if (!stats[macroId]) {
      stats[macroId] = { count: 0, lastUsed: null };
    }
    
    stats[macroId].count++;
    stats[macroId].lastUsed = Date.now();
    
    await chrome.storage.sync.set({ macroStats: stats });
  } catch (error) {
    console.error('Fountain - Macro Assistant: Error updating stats:', error);
  }
}

// Handle Ctrl+Z for undo
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    const element = getInputElement();
    if (element && expansionHistory.length > 0) {
      const lastExpansion = expansionHistory[0];
      // Check if this element matches the last expansion
      if (lastExpansion.element === element) {
        e.preventDefault();
        undoExpansion(lastExpansion);
      }
    }
  }
});

// Check if element is editable (enhanced for all websites including Slack)
function isEditable(element) {
  if (!element) return false;
  
  const tagName = element.tagName.toLowerCase();
  
  // Support all input types that accept text
  const isInput = tagName === 'input' && (
    element.type === 'text' || 
    element.type === 'email' || 
    element.type === 'search' || 
    element.type === 'url' || 
    element.type === 'password' ||
    element.type === 'tel' ||
    element.type === 'number' ||
    element.type === 'datetime-local' ||
    element.type === 'date' ||
    element.type === 'time' ||
    element.type === 'month' ||
    element.type === 'week' ||
    !element.type || // Default type is text
    element.type === '' // Empty string also defaults to text
  );
  
  const isTextarea = tagName === 'textarea';
  
  // Enhanced contentEditable detection
  const isContentEditable = 
    element.contentEditable === 'true' || 
    element.contentEditable === true ||
    element.isContentEditable === true ||
    (element.getAttribute && element.getAttribute('contenteditable') === 'true');
  
  // Check for role-based editable elements (used by some frameworks)
  const hasEditableRole = element.getAttribute && (
    element.getAttribute('role') === 'textbox' ||
    element.getAttribute('role') === 'combobox'
  );
  
  // Check if element is disabled or readonly
  const isDisabled = element.disabled || element.readOnly || 
    (element.getAttribute && (
      element.getAttribute('disabled') !== null ||
      element.getAttribute('readonly') !== null
    ));
  
  if (isDisabled) return false;
  
  return isInput || isTextarea || isContentEditable || hasEditableRole;
}

// Get the current input element (enhanced for shadow DOM and complex sites)
function getInputElement() {
  let activeElement = document.activeElement;
  
  // Handle shadow DOM (used by Slack and other modern apps)
  while (activeElement && activeElement.shadowRoot) {
    const shadowActive = activeElement.shadowRoot.activeElement;
    if (shadowActive) {
      activeElement = shadowActive;
    } else {
      break;
    }
  }
  
  if (isEditable(activeElement)) {
    return activeElement;
  }
  
  // Fallback: Check if active element is inside an editable container
  // (useful for complex editors like Slack, Discord, Notion, etc.)
  let parent = activeElement;
  for (let i = 0; i < 5 && parent; i++) { // Check up to 5 levels up
    if (isEditable(parent)) {
      return parent;
    }
    parent = parent.parentElement;
    
    // Check shadow DOM parent
    if (parent && parent.shadowRoot) {
      const shadowParent = parent.shadowRoot.activeElement || parent.shadowRoot.querySelector('[contenteditable="true"]');
      if (shadowParent && isEditable(shadowParent)) {
        return shadowParent;
      }
    }
  }
  
  return null;
}

// Insert text at cursor position (enhanced for all input types)
function insertTextAtCursor(element, text) {
  const tagName = element.tagName.toLowerCase();
  
  if (tagName === 'input') {
    const start = element.selectionStart || 0;
    const end = element.selectionEnd || 0;
    const value = element.value || '';
    element.value = value.substring(0, start) + text + value.substring(end);
    element.selectionStart = element.selectionEnd = start + text.length;
    
    // Trigger multiple events for better compatibility
    element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  } else if (tagName === 'textarea') {
    const start = element.selectionStart || 0;
    const end = element.selectionEnd || 0;
    const value = element.value || '';
    element.value = value.substring(0, start) + text + value.substring(end);
    element.selectionStart = element.selectionEnd = start + text.length;
    
    // Trigger multiple events for better compatibility
    element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (element.isContentEditable || element.contentEditable === 'true' || 
             element.getAttribute('contenteditable') === 'true') {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Trigger multiple events for better compatibility with frameworks
      element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    } else {
      // Fallback: append text if no selection
      element.textContent = (element.textContent || '') + text;
      element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }
  }
}

// Perform the actual expansion (helper function)
function performExpansion(element, matchedShortcut, processedExpansion, undoState, macro) {
  try {
    // Remove the shortcut and replace with expansion
    if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
      const currentValue = element.value;
      // Find where the matched shortcut/alias ends in the current value
      const shortcutEnd = currentValue.length;
      const shortcutStart = shortcutEnd - matchedShortcut.length;
      
      // Replace the shortcut with processed expansion
      const newValue = currentValue.substring(0, shortcutStart) + processedExpansion;
      undoState.newValue = newValue;
      element.value = newValue;
      element.selectionStart = element.selectionEnd = newValue.length;
      
      // Save to history
      expansionHistory.unshift(undoState);
      if (expansionHistory.length > MAX_HISTORY) {
        expansionHistory.pop();
      }
      
      // Show undo notification
      showUndoNotification(undoState);
      
      // Update usage statistics
      updateUsageStats(macro.id);
      
      // Trigger events
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.isContentEditable || element.contentEditable === 'true') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        
        if (textNode.nodeType === Node.TEXT_NODE) {
          const textContent = textNode.textContent;
          const caseSensitive = macro.caseSensitive || false;
          const shortcutIndex = caseSensitive 
            ? textContent.lastIndexOf(matchedShortcut)
            : textContent.toLowerCase().lastIndexOf(matchedShortcut.toLowerCase());
          
          if (shortcutIndex !== -1 && shortcutIndex + matchedShortcut.length === textContent.length) {
            const newText = textContent.substring(0, shortcutIndex) + processedExpansion;
            textNode.textContent = newText;
            
            // Set cursor to end
            const newRange = document.createRange();
            newRange.setStart(textNode, newText.length);
            newRange.setEnd(textNode, newText.length);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            element.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }
    }

    // Show notification if enabled
    if (settings.enableNotifications) {
      showNotification(`Expanded: ${macro.shortcut} → ${macro.expansion.substring(0, 30)}${macro.expansion.length > 30 ? '...' : ''}`);
    }

    isExpanding = false;
  } catch (error) {
    console.error('Fountain - Macro Assistant: Error performing expansion:', error);
    isExpanding = false;
  }
}

// Find and expand macro
function expandMacro(element, text, requireTrigger = false) {
  if (isExpanding || !text) {
    return false;
  }

  if (macros.length === 0) {
    console.log('Fountain - Macro Assistant: No macros loaded');
    return false;
  }

  // Sort macros by length (longest first) to match longer shortcuts first
  const sortedMacros = [...macros].sort((a, b) => b.shortcut.length - a.shortcut.length);

  for (const macro of sortedMacros) {
    const shortcut = macro.shortcut;
    const aliases = macro.aliases || [];
    const expansion = macro.expansion;
    const caseSensitive = macro.caseSensitive || false;
    const conditions = macro.conditions || {};

    if (!shortcut || !expansion) continue;

    // Check if macro conditions are met
    if (!checkConditions(conditions)) {
      continue;
    }

    // Check if text matches shortcut or any alias
    let match = false;
    let matchedShortcut = shortcut;
    
    // Check primary shortcut
    if (caseSensitive) {
      match = text.endsWith(shortcut);
    } else {
      match = text.toLowerCase().endsWith(shortcut.toLowerCase());
    }
    
    // Check aliases if primary doesn't match
    if (!match && aliases.length > 0) {
      for (const alias of aliases) {
        if (caseSensitive) {
          if (text.endsWith(alias)) {
            match = true;
            matchedShortcut = alias;
            break;
          }
        } else {
          if (text.toLowerCase().endsWith(alias.toLowerCase())) {
            match = true;
            matchedShortcut = alias;
            break;
          }
        }
      }
    }

    if (match) {
      // Check if shortcut is at word boundary or followed by space/punctuation
      const beforeShortcut = text.substring(0, text.length - matchedShortcut.length);
      const lastChar = beforeShortcut[beforeShortcut.length - 1];
      const isWordBoundary = !lastChar || /[\s\n\r\t.,;:!?()[\]{}'"`]/.test(lastChar);

      // If requireTrigger is false, expand immediately when shortcut matches
      // If requireTrigger is true, only expand on word boundary or trigger character
      if (!requireTrigger || isWordBoundary || beforeShortcut.length === 0) {
        // Get conditional expansion if conditions are set
        const finalExpansion = getConditionalExpansion(macro, expansion);
        
        console.log('Fountain - Macro Assistant: Expanding', matchedShortcut, '→', finalExpansion);
        isExpanding = true;
        
        // Process macro variables (synchronous)
        let processedExpansion = processMacroVariables(finalExpansion);
        
        // Check if clipboard variable is needed
        const needsClipboard = processedExpansion.includes('{clipboard}');
        
        // Perform expansion synchronously (clipboard will be handled separately if needed)
        try {
          // Get current cursor position and save state for undo
          let startPos, endPos, oldValue;
          if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
            startPos = element.selectionStart;
            endPos = element.selectionEnd;
            oldValue = element.value;
          } else {
            // For contentEditable, we'll handle it differently
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const textNode = range.startContainer;
              if (textNode.nodeType === Node.TEXT_NODE) {
                startPos = range.startOffset;
                oldValue = element.textContent || element.innerText || '';
              }
            }
          }

          // Save state for undo
          const undoState = {
            element: element,
            oldValue: oldValue,
            newValue: '',
            shortcut: shortcut,
            timestamp: Date.now()
          };

          // Handle clipboard asynchronously if needed, otherwise expand immediately
          if (needsClipboard) {
            // Process clipboard asynchronously
            processClipboardVariable(processedExpansion).then((finalExpansion) => {
              performExpansion(element, matchedShortcut, finalExpansion, undoState, macro);
            });
          } else {
            // Expand immediately (synchronous)
            performExpansion(element, matchedShortcut, processedExpansion, undoState, macro);
          }
        } catch (error) {
          console.error('Fountain - Macro Assistant: Error during expansion:', error);
          isExpanding = false;
        }
        
        return true;
      }
    }
  }

  return false;
}

// Track typing state to avoid expanding while user is still typing
let typingTimeout;
let lastTypedText = '';

// Track the last input value to detect when space/enter is pressed
let lastInputValue = '';

// Handle keydown events for trigger-based expansion (space, enter, punctuation)
document.addEventListener('keydown', (e) => {
  // Skip if modifier keys are pressed (except Shift for case sensitivity)
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return;
  }

  const element = getInputElement();
  if (!element) return;

  // Store current value before the key is processed
  if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
    lastInputValue = element.value;
  } else if (element.isContentEditable || element.contentEditable === 'true') {
    lastInputValue = element.textContent || element.innerText || '';
  }

  // Trigger expansion on space, enter, or punctuation
  if (e.key === ' ' || e.key === 'Enter' || /[.,;:!?()[\]{}]/.test(e.key)) {
    console.log('Fountain - Macro Assistant: Trigger key pressed:', e.key, 'Text before trigger:', lastInputValue);
    
    // Expand immediately with the text before the trigger
    if (lastInputValue.length > 0) {
      const expanded = expandMacro(element, lastInputValue, true);
      if (expanded && (e.key === ' ' || e.key === 'Enter')) {
        // Prevent the space/enter from being added if expansion succeeded
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  }
}, true); // Use capture phase to catch events earlier

// Auto-expand on input (as user types) - if enabled in settings
document.addEventListener('input', (e) => {
  if (isExpanding) return;
  
  const element = e.target;
  if (!isEditable(element)) return;

  // Clear previous timeout
  clearTimeout(typingTimeout);

  // Get current text
  let text = '';
  if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
    text = element.value;
  } else if (element.isContentEditable || element.contentEditable === 'true') {
    text = element.textContent || element.innerText || '';
  }

  // Check if a space was just added (for immediate expansion)
  if (text.endsWith(' ') && lastInputValue && text === lastInputValue + ' ') {
    // Space was just added, check if the text before space matches a shortcut
    const textBeforeSpace = lastInputValue;
    if (textBeforeSpace.length > 0) {
      console.log('Fountain - Macro Assistant: Space detected, checking:', textBeforeSpace);
      // Small delay to let the space be added, then we'll remove it and expand
      setTimeout(() => {
        if (document.activeElement === element) {
          const expanded = expandMacro(element, textBeforeSpace, true);
          if (expanded) {
            // The expansion already happened, but we need to remove the space
            if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
              if (element.value.endsWith(' ')) {
                element.value = element.value.slice(0, -1);
                element.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }
          }
        }
      }, 10);
      return;
    }
  }

  // Check if auto-expand is enabled
  if (settings.autoExpand) {
    // Check if current text exactly matches a shortcut
    const sortedMacros = [...macros].sort((a, b) => b.shortcut.length - a.shortcut.length);
    for (const macro of sortedMacros) {
      const shortcut = macro.shortcut;
      if (!shortcut) continue;
      
      const caseSensitive = macro.caseSensitive || false;
      
      let exactMatch = false;
      if (caseSensitive) {
        exactMatch = text === shortcut;
      } else {
        exactMatch = text.toLowerCase() === shortcut.toLowerCase();
      }

      if (exactMatch) {
        console.log('Fountain - Macro Assistant: Exact match found:', shortcut);
        // Exact match - expand after a short delay
        typingTimeout = setTimeout(() => {
          // Verify text still matches and element is still focused
          if (document.activeElement !== element) return;
          
          let currentText = '';
          if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
            currentText = element.value;
          } else if (element.isContentEditable || element.contentEditable === 'true') {
            currentText = element.textContent || element.innerText || '';
          }

          let stillMatches = false;
          if (caseSensitive) {
            stillMatches = currentText === shortcut;
          } else {
            stillMatches = currentText.toLowerCase() === shortcut.toLowerCase();
          }

          if (stillMatches && currentText !== lastTypedText) {
            expandMacro(element, currentText, false);
            lastTypedText = currentText;
          }
        }, 500); // 500ms delay
        return;
      }
    }

    // If no exact match, check for shortcuts at the end after user stops typing
    typingTimeout = setTimeout(() => {
      if (document.activeElement !== element) return;
      
      let currentText = '';
      if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
        currentText = element.value;
      } else if (element.isContentEditable || element.contentEditable === 'true') {
        currentText = element.textContent || element.innerText || '';
      }

      // Only expand if text hasn't changed (user stopped typing)
      if (currentText === text && currentText !== lastTypedText && currentText.length > 0) {
        expandMacro(element, currentText, false);
        lastTypedText = currentText;
      }
    }, 1000); // Wait 1 second after user stops typing
  } else {
    // Auto-expand disabled - only expand on explicit triggers (space, punctuation)
    typingTimeout = setTimeout(() => {
      let currentText = '';
      if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
        currentText = element.value;
      } else if (element.isContentEditable || element.contentEditable === 'true') {
        currentText = element.textContent || element.innerText || '';
      }

      const lastChar = currentText[currentText.length - 1];
      if (lastChar && (lastChar === ' ' || /[.,;:!?()[\]{}]/.test(lastChar))) {
        expandMacro(element, currentText, true);
      }
    }, 100);
  }
});


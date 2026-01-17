// Macro-Assistant - Macro Assistant v3.0 - Content Script
// Full-featured text expansion with regex, JS, counters, auto-suggest, and more

let macros = [];
let counters = {};
let settings = { autoExpand: true, enableNotifications: false, showSuggestions: true };
let isExpanding = false;
let expansionHistory = [];
const MAX_HISTORY = 10;

// Auto-suggest state
let suggestPopup = null;
let suggestItems = [];
let suggestIndex = -1;
let lastTypedText = '';

// Load data
async function loadMacros() {
  try {
    const result = await chrome.storage.sync.get(['macros', 'counters', 'settings']);
    macros = result.macros || [];
    counters = result.counters || {};
    settings = result.settings || { autoExpand: true, showSuggestions: true };
    console.log('💧 Macro-Assistant: Loaded', macros.length, 'macros');
  } catch (error) {
    console.error('💧 Macro-Assistant: Error loading:', error);
  }
}

// Initialize
(async () => {
  await loadMacros();
  console.log('💧 Macro-Assistant: Ready!');
})();

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.macros) macros = changes.macros.newValue || [];
    if (changes.counters) counters = changes.counters.newValue || {};
    if (changes.settings) settings = changes.settings.newValue || settings;
  }
});

// Get current domain
function getCurrentDomain() {
  try { return window.location.hostname.toLowerCase(); } catch { return ''; }
}

// Check domain restrictions
function isMacroAllowed(macro) {
  if (macro.enabled === false) return false;
  
  const domain = getCurrentDomain();
  
  // Check blacklist
  if (macro.blacklist?.length) {
    if (macro.blacklist.some(b => domain === b || domain.endsWith('.' + b))) return false;
  }
  
  // Check whitelist (domains)
  if (macro.domains?.length) {
    if (!macro.domains.some(d => domain === d || domain.endsWith('.' + d))) return false;
  }
  
  return true;
}

// Date formatting
function formatDate(date, format) {
  const map = {
    'YYYY': date.getFullYear(),
    'YY': String(date.getFullYear()).slice(-2),
    'MMMM': date.toLocaleDateString('en-US', { month: 'long' }),
    'MMM': date.toLocaleDateString('en-US', { month: 'short' }),
    'MM': String(date.getMonth() + 1).padStart(2, '0'),
    'M': date.getMonth() + 1,
    'DDDD': date.toLocaleDateString('en-US', { weekday: 'long' }),
    'DDD': date.toLocaleDateString('en-US', { weekday: 'short' }),
    'DD': String(date.getDate()).padStart(2, '0'),
    'D': date.getDate(),
    'HH': String(date.getHours()).padStart(2, '0'),
    'H': date.getHours(),
    'hh': String(date.getHours() % 12 || 12).padStart(2, '0'),
    'h': date.getHours() % 12 || 12,
    'mm': String(date.getMinutes()).padStart(2, '0'),
    'm': date.getMinutes(),
    'ss': String(date.getSeconds()).padStart(2, '0'),
    's': date.getSeconds(),
    'A': date.getHours() >= 12 ? 'PM' : 'AM',
    'a': date.getHours() >= 12 ? 'pm' : 'am'
  };
  
  let result = format;
  // Sort by length to replace longer patterns first
  Object.entries(map).sort((a, b) => b[0].length - a[0].length).forEach(([k, v]) => {
    result = result.replace(new RegExp(k, 'g'), v);
  });
  return result;
}

// Process variables
async function processVariables(text, regexMatch = null) {
  const now = new Date();
  
  // Date with format
  text = text.replace(/\{date:([^}]+)\}/g, (_, fmt) => formatDate(now, fmt));
  
  // Basic date/time
  text = text.replace(/\{date\}/g, now.toLocaleDateString());
  text = text.replace(/\{time\}/g, now.toLocaleTimeString());
  text = text.replace(/\{datetime\}/g, now.toLocaleString());
  text = text.replace(/\{year\}/g, String(now.getFullYear()));
  text = text.replace(/\{month\}/g, String(now.getMonth() + 1).padStart(2, '0'));
  text = text.replace(/\{day\}/g, String(now.getDate()).padStart(2, '0'));
  text = text.replace(/\{hour\}/g, String(now.getHours()).padStart(2, '0'));
  text = text.replace(/\{minute\}/g, String(now.getMinutes()).padStart(2, '0'));
  text = text.replace(/\{second\}/g, String(now.getSeconds()).padStart(2, '0'));
  text = text.replace(/\{timestamp\}/g, String(now.getTime()));
  
  // Counter
  text = text.replace(/\{counter:([^}]+)\}/g, (_, name) => {
    counters[name] = (counters[name] || 0) + 1;
    chrome.storage.sync.set({ counters });
    return String(counters[name]).padStart(4, '0');
  });
  
  // Random selection
  text = text.replace(/\{random:([^}]+)\}/g, (_, opts) => {
    const options = opts.split('|');
    return options[Math.floor(Math.random() * options.length)];
  });
  
  // Nested macros
  text = text.replace(/\{macro:([^}]+)\}/g, (_, shortcut) => {
    const nested = macros.find(m => m.shortcut === shortcut && isMacroAllowed(m));
    if (nested) {
      // Simple replacement (no recursion for safety)
      return nested.expansion;
    }
    return '';
  });
  
  // JavaScript snippets (sandboxed)
  text = text.replace(/\{js:([^}]+)\}/g, (_, code) => {
    try {
      // Create sandboxed context
      const sandbox = {
        Date, Math, String, Number, Boolean, Array, Object, JSON,
        encodeURIComponent, decodeURIComponent, parseInt, parseFloat,
        isNaN, isFinite
      };
      const fn = new Function(...Object.keys(sandbox), `return ${code}`);
      return String(fn(...Object.values(sandbox)));
    } catch (e) {
      console.warn('💧 Macro-Assistant: JS error:', e);
      return `[error: ${e.message}]`;
    }
  });
  
  // Regex capture groups
  if (regexMatch) {
    for (let i = 1; i < regexMatch.length; i++) {
      text = text.replace(new RegExp(`\\$${i}`, 'g'), regexMatch[i] || '');
    }
    text = text.replace(/\$&/g, regexMatch[0] || '');
  }
  
  // Clipboard
  if (text.includes('{clipboard}')) {
    try {
      const clip = await navigator.clipboard.readText();
      text = text.replace(/\{clipboard\}/g, clip);
    } catch {
      text = text.replace(/\{clipboard\}/g, '');
    }
  }
  
  // Special characters
  text = text.replace(/\{newline\}/g, '\n');
  text = text.replace(/\{tab\}/g, '\t');
  
  return text;
}

// Input prompts
function extractInputPrompts(text) {
  const prompts = [];
  const regex = /\{input:([^}]+)\}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    prompts.push({ full: match[0], label: match[1].trim() });
  }
  return prompts;
}

async function processInputPrompts(text) {
  const prompts = extractInputPrompts(text);
  if (!prompts.length) return text;
  
  for (const prompt of prompts) {
    const value = await showInputPrompt(prompt.label);
    text = text.replace(prompt.full, value);
  }
  return text;
}

function showInputPrompt(label) {
  return new Promise(resolve => {
    const existing = document.getElementById('fountain-prompt');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'fountain-prompt';
    modal.innerHTML = `
      <style>
        #fountain-prompt {
          position: fixed; inset: 0; z-index: 2147483647;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }
        .fp-box {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 12px; padding: 20px; min-width: 300px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .fp-title { color: #e6edf3; font-size: 15px; font-weight: 600; margin-bottom: 14px; text-align: center; }
        .fp-input {
          width: 100%; padding: 10px 12px; border: 1px solid #30363d;
          border-radius: 8px; background: #0d1117; color: #e6edf3;
          font-size: 14px; outline: none; transition: all 0.15s;
        }
        .fp-input:focus { border-color: #00b3b3; box-shadow: 0 0 0 3px rgba(0,179,179,0.15); }
        .fp-btns { display: flex; gap: 8px; margin-top: 14px; justify-content: flex-end; }
        .fp-btn {
          padding: 8px 16px; border: none; border-radius: 6px; font-size: 13px;
          font-weight: 500; cursor: pointer; transition: all 0.15s;
        }
        .fp-cancel { background: #21262d; color: #8b949e; border: 1px solid #30363d; }
        .fp-cancel:hover { background: #30363d; color: #e6edf3; }
        .fp-ok { background: #00b3b3; color: #fff; }
        .fp-ok:hover { background: #26cccc; }
      </style>
      <div class="fp-box">
        <div class="fp-title">${escapeHtml(label)}</div>
        <input type="text" class="fp-input" placeholder="Enter ${escapeHtml(label)}..." autofocus>
        <div class="fp-btns">
          <button class="fp-btn fp-cancel">Cancel</button>
          <button class="fp-btn fp-ok">OK</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const input = modal.querySelector('.fp-input');
    const okBtn = modal.querySelector('.fp-ok');
    const cancelBtn = modal.querySelector('.fp-cancel');
    
    const cleanup = () => modal.remove();
    const confirm = () => { cleanup(); resolve(input.value); };
    const cancel = () => { cleanup(); resolve(''); };
    
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') confirm();
      if (e.key === 'Escape') cancel();
    });
    okBtn.addEventListener('click', confirm);
    cancelBtn.addEventListener('click', cancel);
    modal.addEventListener('click', e => { if (e.target === modal) cancel(); });
    
    setTimeout(() => input.focus(), 50);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Undo notification
function showUndoToast(state) {
  const existing = document.querySelector('.fountain-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'fountain-toast';
  toast.innerHTML = `
    <style>
      .fountain-toast {
        position: fixed; bottom: 16px; right: 16px; z-index: 2147483646;
        background: #161b22; border: 1px solid #30363d;
        color: #e6edf3; padding: 10px 14px; border-radius: 8px;
        display: flex; align-items: center; gap: 10px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; font-size: 13px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      }
      .ft-undo {
        background: #00b3b3; border: none;
        color: #fff; padding: 5px 12px; border-radius: 5px; font-size: 12px;
        font-weight: 500; cursor: pointer; transition: all 0.15s;
      }
      .ft-undo:hover { background: #26cccc; }
    </style>
    <span>Expanded: ${escapeHtml(state.shortcut)}</span>
    <button class="ft-undo">Undo</button>
  `;
  
  document.body.appendChild(toast);
  
  toast.querySelector('.ft-undo').addEventListener('click', () => {
    undoExpansion(state);
    toast.remove();
  });
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'ftIn 0.3s reverse';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

function undoExpansion(state) {
  try {
    const el = state.element;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = state.oldValue;
      el.selectionStart = el.selectionEnd = state.oldValue.length;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (el.isContentEditable) {
      el.textContent = state.oldValue;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const idx = expansionHistory.indexOf(state);
    if (idx > -1) expansionHistory.splice(idx, 1);
  } catch (e) {
    console.error('💧 Macro-Assistant: Undo error:', e);
  }
}

// Check conditions
function checkConditions(conditions) {
  if (!conditions || !Object.keys(conditions).length) return true;
  
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  if (conditions.timeRange) {
    const { start, end } = conditions.timeRange;
    if (start !== undefined && end !== undefined) {
      if (start > end) {
        if (hour < start && hour >= end) return false;
      } else {
        if (hour < start || hour >= end) return false;
      }
    }
  }
  
  if (conditions.days?.length && !conditions.days.includes(day)) return false;
  
  if (conditions.weekdayOnly !== undefined) {
    const isWeekday = day >= 1 && day <= 5;
    if (conditions.weekdayOnly && !isWeekday) return false;
    if (!conditions.weekdayOnly && isWeekday) return false;
  }
  
  return true;
}

function getConditionalExpansion(macro) {
  const conds = macro.conditions || {};
  if (!conds.expansions?.length) return macro.expansion;
  
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  for (const ce of conds.expansions) {
    let match = true;
    
    if (ce.timeRange) {
      const { start, end } = ce.timeRange;
      if (start !== undefined && end !== undefined) {
        if (start > end) {
          if (hour < start && hour >= end) match = false;
        } else {
          if (hour < start || hour >= end) match = false;
        }
      }
    }
    
    if (ce.day !== undefined && ce.day !== day) match = false;
    
    if (ce.weekdayOnly !== undefined) {
      const isWeekday = day >= 1 && day <= 5;
      if (ce.weekdayOnly && !isWeekday) match = false;
      if (!ce.weekdayOnly && isWeekday) match = false;
    }
    
    if (match) return ce.expansion;
  }
  
  return macro.expansion;
}

// Update stats
async function updateStats(macroId) {
  try {
    const result = await chrome.storage.sync.get(['macroStats']);
    const stats = result.macroStats || {};
    if (!stats[macroId]) stats[macroId] = { count: 0, lastUsed: null };
    stats[macroId].count++;
    stats[macroId].lastUsed = Date.now();
    await chrome.storage.sync.set({ macroStats: stats });
  } catch (e) {
    console.error('💧 Macro-Assistant: Stats error:', e);
  }
}

// Typewriter effect
async function typewriterInsert(element, text, delay = 20) {
  for (const char of text) {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.value += char;
    } else {
      element.textContent += char;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, delay));
  }
}

// Cursor positioning
function setCursor(element, position) {
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    element.selectionStart = element.selectionEnd = position;
  } else if (element.isContentEditable) {
    try {
      const range = document.createRange();
      const sel = window.getSelection();
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let pos = 0;
      let node;
      while ((node = walker.nextNode())) {
        if (pos + node.textContent.length >= position) {
          range.setStart(node, position - pos);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          break;
        }
        pos += node.textContent.length;
      }
    } catch (e) {}
  }
}

// Perform expansion
async function performExpansion(element, matchedText, expansion, macro, regexMatch = null) {
  try {
    const oldValue = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA'
      ? element.value
      : element.textContent || '';
    
    // Process all variables
    let processed = await processVariables(expansion, regexMatch);
    
    // Process input prompts
    if (processed.includes('{input:')) {
      processed = await processInputPrompts(processed);
    }
    
    // Find cursor position
    let cursorPos = -1;
    if (processed.includes('{cursor}')) {
      const before = oldValue.substring(0, oldValue.length - matchedText.length);
      cursorPos = before.length + processed.indexOf('{cursor}');
      processed = processed.replace('{cursor}', '');
    }
    
    // Save undo state
    const undoState = { element, oldValue, shortcut: macro.shortcut, timestamp: Date.now() };
    
    // Perform replacement
    const beforeMatch = oldValue.substring(0, oldValue.length - matchedText.length);
    const newValue = beforeMatch + processed;
    
    if (macro.typewriter) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = beforeMatch;
      } else {
        element.textContent = beforeMatch;
      }
      await typewriterInsert(element, processed);
    } else {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = newValue;
      } else {
        element.textContent = newValue;
      }
    }
    
    // Set cursor
    if (cursorPos >= 0) {
      setCursor(element, cursorPos);
    } else {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.selectionStart = element.selectionEnd = newValue.length;
      }
    }
    
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Save history
    expansionHistory.unshift(undoState);
    if (expansionHistory.length > MAX_HISTORY) expansionHistory.pop();
    
    // Show toast
    showUndoToast(undoState);
    
    // Update stats
    updateStats(macro.id);
    
    isExpanding = false;
    return true;
  } catch (e) {
    console.error('💧 Macro-Assistant: Expansion error:', e);
    isExpanding = false;
    return false;
  }
}

// Find and expand macro
function expandMacro(element, text, requireTrigger = false) {
  if (isExpanding || !text || !macros.length) return false;
  
  // Sort by shortcut length (longest first)
  const sorted = [...macros].sort((a, b) => b.shortcut.length - a.shortcut.length);
  
  for (const macro of sorted) {
    if (!isMacroAllowed(macro)) continue;
    if (!checkConditions(macro.conditions)) continue;
    
    const { shortcut, aliases = [], caseSensitive = false, isRegex } = macro;
    
    // Regex matching
    if (isRegex) {
      try {
        const regex = new RegExp(shortcut + '$', caseSensitive ? '' : 'i');
        const match = text.match(regex);
        if (match) {
          console.log('💧 Macro-Assistant: Regex match', shortcut);
          isExpanding = true;
          const expansion = getConditionalExpansion(macro);
          performExpansion(element, match[0], expansion, macro, match);
          return true;
        }
      } catch (e) {
        console.warn('💧 Macro-Assistant: Invalid regex:', shortcut);
      }
      continue;
    }
    
    // Normal matching
    const allShortcuts = [shortcut, ...aliases];
    let matched = null;
    
    for (const sc of allShortcuts) {
      const textEnd = caseSensitive ? text : text.toLowerCase();
      const scCheck = caseSensitive ? sc : sc.toLowerCase();
      if (textEnd.endsWith(scCheck)) {
        matched = sc;
        break;
      }
    }
    
    if (matched) {
      const before = text.substring(0, text.length - matched.length);
      const lastChar = before[before.length - 1];
      const isWordBoundary = !lastChar || /[\s\n\r\t.,;:!?()[\]{}'"`]/.test(lastChar);
      
      if (!requireTrigger || isWordBoundary || !before.length) {
        console.log('💧 Macro-Assistant: Expanding', matched);
        isExpanding = true;
        const expansion = getConditionalExpansion(macro);
        performExpansion(element, matched, expansion, macro);
        return true;
      }
    }
  }
  
  return false;
}

// Auto-suggest popup
function showSuggestPopup(element, suggestions) {
  hideSuggestPopup();
  if (!suggestions.length || !settings.showSuggestions) return;
  
  const rect = element.getBoundingClientRect();
  
  suggestPopup = document.createElement('div');
  suggestPopup.className = 'fountain-suggest';
  suggestPopup.innerHTML = `
    <style>
      .fountain-suggest {
        position: fixed;
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 8px;
        max-width: 260px;
        max-height: 160px;
        overflow-y: auto;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        z-index: 2147483645;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }
      .fs-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        cursor: pointer;
        transition: background 0.1s;
        border-bottom: 1px solid #21262d;
      }
      .fs-item:last-child { border-bottom: none; }
      .fs-item:hover, .fs-item.selected {
        background: #21262d;
      }
      .fs-item.selected {
        border-left: 2px solid #00b3b3;
      }
      .fs-shortcut {
        font-family: 'JetBrains Mono', Consolas, monospace;
        font-size: 12px;
        font-weight: 500;
        color: #00b3b3;
      }
      .fs-preview {
        font-size: 11px;
        color: #6e7681;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }
    </style>
    ${suggestions.map((s, i) => `
      <div class="fs-item ${i === 0 ? 'selected' : ''}" data-index="${i}">
        <span class="fs-shortcut">${escapeHtml(s.shortcut)}</span>
        <span class="fs-preview">${escapeHtml(s.expansion.substring(0, 40))}${s.expansion.length > 40 ? '...' : ''}</span>
      </div>
    `).join('')}
  `;
  
  // Position popup
  suggestPopup.style.left = `${rect.left}px`;
  suggestPopup.style.top = `${rect.bottom + 5}px`;
  
  document.body.appendChild(suggestPopup);
  
  suggestItems = suggestions;
  suggestIndex = 0;
  
  // Click handlers
  suggestPopup.querySelectorAll('.fs-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.index);
      selectSuggestion(element, idx);
    });
  });
}

function hideSuggestPopup() {
  if (suggestPopup) {
    suggestPopup.remove();
    suggestPopup = null;
  }
  suggestItems = [];
  suggestIndex = -1;
}

function selectSuggestion(element, index) {
  const suggestion = suggestItems[index];
  if (!suggestion) return;
  
  hideSuggestPopup();
  
  // Get current text and find matching prefix
  const text = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA'
    ? element.value
    : element.textContent || '';
  
  // Find how much of the shortcut is typed
  const shortcut = suggestion.shortcut;
  for (let len = shortcut.length; len >= 1; len--) {
    const prefix = shortcut.substring(0, len);
    if (text.toLowerCase().endsWith(prefix.toLowerCase())) {
      // Replace the typed prefix with full expansion
      const before = text.substring(0, text.length - len);
      isExpanding = true;
      performExpansion(element, prefix, getConditionalExpansion(suggestion), suggestion);
      return;
    }
  }
}

function updateSuggestions(element, text) {
  if (!settings.showSuggestions || !text) {
    hideSuggestPopup();
    return;
  }
  
  // Find matching macros (prefix match on shortcut)
  const matches = macros.filter(m => {
    if (!isMacroAllowed(m)) return false;
    const sc = m.shortcut.toLowerCase();
    const allSc = [sc, ...(m.aliases || []).map(a => a.toLowerCase())];
    return allSc.some(s => s.startsWith(text.toLowerCase()) && s !== text.toLowerCase());
  }).slice(0, 5);
  
  if (matches.length > 0) {
    showSuggestPopup(element, matches);
  } else {
    hideSuggestPopup();
  }
}

// Check if element is editable
function isEditable(el) {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  const isInput = tag === 'input' && (!el.type || ['text', 'email', 'search', 'url', 'tel', 'password'].includes(el.type));
  return isInput || tag === 'textarea' || el.contentEditable === 'true' || el.isContentEditable;
}

function getInputElement() {
  const el = document.activeElement;
  return isEditable(el) ? el : null;
}

// Event: Ctrl+Z undo
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    const el = getInputElement();
    if (el && expansionHistory.length) {
      const last = expansionHistory[0];
      if (last.element === el) {
        e.preventDefault();
        undoExpansion(last);
      }
    }
  }
  
  // Navigate suggestions
  if (suggestPopup) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      suggestIndex = Math.min(suggestIndex + 1, suggestItems.length - 1);
      updateSuggestSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      suggestIndex = Math.max(suggestIndex - 1, 0);
      updateSuggestSelection();
    } else if (e.key === 'Tab' || e.key === 'Enter') {
      if (suggestIndex >= 0) {
        e.preventDefault();
        selectSuggestion(getInputElement(), suggestIndex);
      }
    } else if (e.key === 'Escape') {
      hideSuggestPopup();
    }
  }
});

function updateSuggestSelection() {
  if (!suggestPopup) return;
  suggestPopup.querySelectorAll('.fs-item').forEach((item, i) => {
    item.classList.toggle('selected', i === suggestIndex);
  });
}

// Event: Trigger keys
let lastValue = '';
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  
  const el = getInputElement();
  if (!el) return;
  
  lastValue = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
    ? el.value
    : el.textContent || '';
  
  if (e.key === ' ' || e.key === 'Enter' || /^[.,;:!?()[\]{}]$/.test(e.key)) {
    if (lastValue && !suggestPopup) {
      const expanded = expandMacro(el, lastValue, true);
      if (expanded && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    hideSuggestPopup();
  }
}, true);

// Event: Input for auto-expand and suggestions
let typingTimeout;
document.addEventListener('input', e => {
  if (isExpanding) return;
  
  const el = e.target;
  if (!isEditable(el)) return;
  
  clearTimeout(typingTimeout);
  
  const text = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
    ? el.value
    : el.textContent || '';
  
  // Check for potential macro prefixes (show suggestions)
  const words = text.split(/\s+/);
  const lastWord = words[words.length - 1];
  
  if (lastWord && lastWord.length >= 1 && /^[\/\.\@\#]/.test(lastWord)) {
    updateSuggestions(el, lastWord);
  } else {
    hideSuggestPopup();
  }
  
  // Auto-expand after pause
  if (settings.autoExpand) {
    typingTimeout = setTimeout(() => {
      if (document.activeElement !== el) return;
      const current = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
        ? el.value
        : el.textContent || '';
      if (current === text && current.length > 0) {
        expandMacro(el, current, false);
      }
    }, 800);
  }
});

// Hide suggestions on blur
document.addEventListener('focusout', () => {
  setTimeout(hideSuggestPopup, 200);
});

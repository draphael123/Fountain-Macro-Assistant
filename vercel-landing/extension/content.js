// Fountain - Macro Assistant v3.0 - Content Script
// Full-featured text expansion with regex, JS, counters, auto-suggest, and more

let macros = [];
let counters = {};
let autoCorrections = {};
let settings = { autoExpand: true, enableNotifications: false, showSuggestions: true, autoCorrect: true };
let isExpanding = false;
let expansionHistory = [];
const MAX_HISTORY = 10;

// Common auto-corrections (built-in)
const COMMON_TYPOS = {
  'teh': 'the', 'taht': 'that', 'adn': 'and', 'dont': "don't", 'wont': "won't",
  'cant': "can't", 'didnt': "didn't", 'doesnt': "doesn't", 'wouldnt': "wouldn't",
  'youre': "you're", 'theyre': "they're", 'thier': 'their', 'recieve': 'receive',
  'beleive': 'believe', 'occured': 'occurred', 'seperate': 'separate',
  'definately': 'definitely', 'occassion': 'occasion', 'accomodate': 'accommodate',
  'wierd': 'weird', 'untill': 'until', 'neccessary': 'necessary', 'acheive': 'achieve',
  'tommorrow': 'tomorrow', 'independant': 'independent', 'calender': 'calendar',
  'embarass': 'embarrass', 'goverment': 'government', 'managment': 'management',
  'enviroment': 'environment', 'recomend': 'recommend', 'refered': 'referred',
  'begining': 'beginning', 'writting': 'writing', 'comming': 'coming',
  'ie': 'i.e.', 'eg': 'e.g.', 'etc': 'etc.', 'btw': 'by the way',
  'asap': 'ASAP', 'fyi': 'FYI', 'imo': 'in my opinion', 'imho': 'in my humble opinion',
};

// Auto-suggest state
let suggestPopup = null;
let suggestItems = [];
let suggestIndex = -1;
let lastTypedText = '';

// Load data
async function loadMacros() {
  try {
    const result = await chrome.storage.sync.get(['macros', 'counters', 'settings', 'autoCorrections']);
    macros = result.macros || [];
    counters = result.counters || {};
    settings = result.settings || { autoExpand: true, showSuggestions: true, autoCorrect: true };
    autoCorrections = result.autoCorrections || {};
    console.log('💧 Fountain: Loaded', macros.length, 'macros');
  } catch (error) {
    console.error('💧 Fountain: Error loading:', error);
  }
}

// Initialize
(async () => {
  await loadMacros();
  console.log('💧 Fountain: Ready!');
})();

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.macros) macros = changes.macros.newValue || [];
    if (changes.counters) counters = changes.counters.newValue || {};
    if (changes.settings) settings = changes.settings.newValue || settings;
    if (changes.autoCorrections) autoCorrections = changes.autoCorrections.newValue || {};
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

// Smart date parsing - natural language to date
function parseSmartDate(expr) {
  const now = new Date();
  const lower = expr.toLowerCase().trim();
  
  // Relative: +3 days, -1 week, +2 months
  const relMatch = lower.match(/^([+-]?\d+)\s*(days?|weeks?|months?|years?|hours?|minutes?)$/);
  if (relMatch) {
    const num = parseInt(relMatch[1]);
    const unit = relMatch[2];
    const result = new Date(now);
    if (unit.startsWith('day')) result.setDate(result.getDate() + num);
    else if (unit.startsWith('week')) result.setDate(result.getDate() + num * 7);
    else if (unit.startsWith('month')) result.setMonth(result.getMonth() + num);
    else if (unit.startsWith('year')) result.setFullYear(result.getFullYear() + num);
    else if (unit.startsWith('hour')) result.setHours(result.getHours() + num);
    else if (unit.startsWith('minute')) result.setMinutes(result.getMinutes() + num);
    return result;
  }
  
  // Named days: today, tomorrow, yesterday
  if (lower === 'today') return now;
  if (lower === 'tomorrow') { const d = new Date(now); d.setDate(d.getDate() + 1); return d; }
  if (lower === 'yesterday') { const d = new Date(now); d.setDate(d.getDate() - 1); return d; }
  
  // Next/last weekday: next monday, last friday
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const nextLastMatch = lower.match(/^(next|last)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/);
  if (nextLastMatch) {
    const dir = nextLastMatch[1] === 'next' ? 1 : -1;
    const targetDay = dayNames.indexOf(nextLastMatch[2]);
    const result = new Date(now);
    let diff = targetDay - result.getDay();
    if (dir === 1 && diff <= 0) diff += 7;
    if (dir === -1 && diff >= 0) diff -= 7;
    result.setDate(result.getDate() + diff);
    return result;
  }
  
  // This weekday: this monday
  const thisMatch = lower.match(/^this\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/);
  if (thisMatch) {
    const targetDay = dayNames.indexOf(thisMatch[1]);
    const result = new Date(now);
    const diff = targetDay - result.getDay();
    result.setDate(result.getDate() + diff);
    return result;
  }
  
  // End of: end of month, end of week, end of year
  if (lower === 'end of month' || lower === 'eom') {
    return new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  if (lower === 'end of week' || lower === 'eow') {
    const d = new Date(now);
    d.setDate(d.getDate() + (6 - d.getDay()));
    return d;
  }
  if (lower === 'end of year' || lower === 'eoy') {
    return new Date(now.getFullYear(), 11, 31);
  }
  
  // Start of: start of month, start of week
  if (lower === 'start of month' || lower === 'som') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (lower === 'start of week' || lower === 'sow') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }
  
  // In X days/weeks: in 3 days, in 2 weeks
  const inMatch = lower.match(/^in\s+(\d+)\s+(days?|weeks?|months?)$/);
  if (inMatch) {
    const num = parseInt(inMatch[1]);
    const unit = inMatch[2];
    const result = new Date(now);
    if (unit.startsWith('day')) result.setDate(result.getDate() + num);
    else if (unit.startsWith('week')) result.setDate(result.getDate() + num * 7);
    else if (unit.startsWith('month')) result.setMonth(result.getMonth() + num);
    return result;
  }
  
  // X days/weeks ago
  const agoMatch = lower.match(/^(\d+)\s+(days?|weeks?|months?)\s+ago$/);
  if (agoMatch) {
    const num = parseInt(agoMatch[1]);
    const unit = agoMatch[2];
    const result = new Date(now);
    if (unit.startsWith('day')) result.setDate(result.getDate() - num);
    else if (unit.startsWith('week')) result.setDate(result.getDate() - num * 7);
    else if (unit.startsWith('month')) result.setMonth(result.getMonth() - num);
    return result;
  }
  
  return now; // Default to today
}

// Math expression evaluator (safe)
function evaluateMath(expr) {
  try {
    // Only allow safe math operations
    const sanitized = expr.replace(/[^0-9+\-*/%().,\s]/g, '');
    if (sanitized !== expr.replace(/\s/g, '').replace(/round|floor|ceil|abs|sqrt|pow|min|max|pi|e/gi, '')) {
      // Has math functions, use safe eval
      const mathFuncs = {
        round: Math.round, floor: Math.floor, ceil: Math.ceil,
        abs: Math.abs, sqrt: Math.sqrt, pow: Math.pow,
        min: Math.min, max: Math.max, pi: Math.PI, e: Math.E,
        sin: Math.sin, cos: Math.cos, tan: Math.tan,
        log: Math.log, log10: Math.log10, random: Math.random
      };
      const fn = new Function(...Object.keys(mathFuncs), `return ${expr}`);
      return fn(...Object.values(mathFuncs));
    }
    // Simple arithmetic only
    return Function(`"use strict"; return (${sanitized})`)();
  } catch (e) {
    console.warn('💧 Fountain: Math error:', e);
    return `[calc error]`;
  }
}

// Process variables
async function processVariables(text, regexMatch = null) {
  const now = new Date();
  
  // === CONDITIONALS: {if:condition}...{else}...{endif} ===
  // Process conditionals first (can contain other variables)
  text = processConditionals(text);
  
  // === LOOPS ===
  // {repeat:n}content{/repeat}
  text = text.replace(/\{repeat:(\d+)\}([\s\S]*?)\{\/repeat\}/g, (_, count, content) => {
    return content.repeat(parseInt(count));
  });
  
  // {list:a,b,c} - creates bulleted list
  text = text.replace(/\{list:([^}]+)\}/g, (_, items) => {
    return items.split(',').map(i => `• ${i.trim()}`).join('\n');
  });
  
  // {numlist:a,b,c} - creates numbered list
  text = text.replace(/\{numlist:([^}]+)\}/g, (_, items) => {
    return items.split(',').map((i, idx) => `${idx + 1}. ${i.trim()}`).join('\n');
  });
  
  // === MATH ===
  // {calc:expression} - math expressions
  text = text.replace(/\{calc:([^}]+)\}/g, (_, expr) => {
    const result = evaluateMath(expr);
    return typeof result === 'number' ? (Number.isInteger(result) ? result : result.toFixed(2)) : result;
  });
  
  // === SMART DATE ===
  // {smartdate:next monday} or {date:+3 days}
  text = text.replace(/\{smartdate:([^}]+)\}/g, (_, expr) => {
    const date = parseSmartDate(expr);
    return date.toLocaleDateString();
  });
  
  // {smartdate:expression:format}
  text = text.replace(/\{smartdate:([^:}]+):([^}]+)\}/g, (_, expr, fmt) => {
    const date = parseSmartDate(expr);
    return formatDate(date, fmt);
  });
  
  // Check if date format contains smart date keywords
  text = text.replace(/\{date:([^}]+)\}/g, (_, fmt) => {
    // Check for smart date patterns
    const smartPatterns = /^(today|tomorrow|yesterday|next|last|this|end of|start of|\+|-|\d+\s+(day|week|month|year)|in\s+\d+)/i;
    if (smartPatterns.test(fmt)) {
      // It's a smart date expression, possibly with format
      const parts = fmt.split('|');
      const expr = parts[0];
      const format = parts[1] || 'MM/DD/YYYY';
      const date = parseSmartDate(expr);
      return formatDate(date, format);
    }
    // Regular date format
    return formatDate(now, fmt);
  });
  
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
  text = text.replace(/\{weekday\}/g, now.toLocaleDateString('en-US', { weekday: 'long' }));
  text = text.replace(/\{monthname\}/g, now.toLocaleDateString('en-US', { month: 'long' }));
  text = text.replace(/\{iso\}/g, now.toISOString().split('T')[0]);
  
  // Counter
  text = text.replace(/\{counter:([^}]+)\}/g, (_, name) => {
    counters[name] = (counters[name] || 0) + 1;
    chrome.storage.sync.set({ counters });
    return String(counters[name]).padStart(4, '0');
  });
  
  // Counter with custom padding
  text = text.replace(/\{counter:([^:}]+):(\d+)\}/g, (_, name, pad) => {
    counters[name] = (counters[name] || 0) + 1;
    chrome.storage.sync.set({ counters });
    return String(counters[name]).padStart(parseInt(pad), '0');
  });
  
  // Random selection
  text = text.replace(/\{random:([^}]+)\}/g, (_, opts) => {
    const options = opts.split('|');
    return options[Math.floor(Math.random() * options.length)];
  });
  
  // Random number range: {random:1-100}
  text = text.replace(/\{randomnum:(\d+)-(\d+)\}/g, (_, min, max) => {
    return String(Math.floor(Math.random() * (parseInt(max) - parseInt(min) + 1)) + parseInt(min));
  });
  
  // UUID
  text = text.replace(/\{uuid\}/g, () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
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
      console.warn('💧 Fountain: JS error:', e);
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
  
  // Selection (current page selection)
  text = text.replace(/\{selection\}/g, () => {
    return window.getSelection()?.toString() || '';
  });
  
  // URL info
  text = text.replace(/\{url\}/g, window.location.href);
  text = text.replace(/\{domain\}/g, window.location.hostname);
  text = text.replace(/\{title\}/g, document.title);
  
  // Special characters
  text = text.replace(/\{newline\}/g, '\n');
  text = text.replace(/\{tab\}/g, '\t');
  text = text.replace(/\{space\}/g, ' ');
  
  // Case transformations
  text = text.replace(/\{upper:([^}]+)\}/g, (_, t) => t.toUpperCase());
  text = text.replace(/\{lower:([^}]+)\}/g, (_, t) => t.toLowerCase());
  text = text.replace(/\{title:([^}]+)\}/g, (_, t) => t.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()));
  
  return text;
}

// Process conditionals: {if:condition}...{else}...{endif}
function processConditionals(text) {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const date = now.getDate();
  const month = now.getMonth() + 1;
  const isWeekday = day >= 1 && day <= 5;
  const isWeekend = day === 0 || day === 6;
  
  // Context for conditions
  const context = {
    hour, day, date, month, isWeekday, isWeekend,
    isMorning: hour >= 5 && hour < 12,
    isAfternoon: hour >= 12 && hour < 17,
    isEvening: hour >= 17 && hour < 21,
    isNight: hour >= 21 || hour < 5,
    isMonday: day === 1, isTuesday: day === 2, isWednesday: day === 3,
    isThursday: day === 4, isFriday: day === 5, isSaturday: day === 6, isSunday: day === 0
  };
  
  // Process {if:condition}...{else}...{endif}
  const ifRegex = /\{if:([^}]+)\}([\s\S]*?)(?:\{else\}([\s\S]*?))?\{endif\}/g;
  
  return text.replace(ifRegex, (_, condition, ifContent, elseContent = '') => {
    try {
      // Evaluate condition in context
      const condLower = condition.toLowerCase().trim();
      
      // Simple named conditions
      if (context[condLower] !== undefined) {
        return context[condLower] ? ifContent : elseContent;
      }
      
      // Time comparisons: hour<12, hour>=18
      const timeMatch = condLower.match(/^hour\s*([<>=!]+)\s*(\d+)$/);
      if (timeMatch) {
        const op = timeMatch[1];
        const val = parseInt(timeMatch[2]);
        let result = false;
        if (op === '<') result = hour < val;
        else if (op === '>') result = hour > val;
        else if (op === '<=' || op === '=<') result = hour <= val;
        else if (op === '>=' || op === '=>') result = hour >= val;
        else if (op === '==' || op === '=') result = hour === val;
        else if (op === '!=' || op === '<>') result = hour !== val;
        return result ? ifContent : elseContent;
      }
      
      // Day comparisons
      const dayMatch = condLower.match(/^day\s*([<>=!]+)\s*(\d+)$/);
      if (dayMatch) {
        const op = dayMatch[1];
        const val = parseInt(dayMatch[2]);
        let result = false;
        if (op === '==') result = day === val;
        else if (op === '!=') result = day !== val;
        return result ? ifContent : elseContent;
      }
      
      // Default: treat as JavaScript expression (safe subset)
      const safeCondition = condition.replace(/[^a-zA-Z0-9<>=!&|() ]/g, '');
      const fn = new Function(...Object.keys(context), `return !!(${safeCondition})`);
      return fn(...Object.values(context)) ? ifContent : elseContent;
    } catch (e) {
      console.warn('💧 Fountain: Condition error:', e);
      return ifContent; // Default to if content on error
    }
  });
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
        .fp-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .fp-btns { display: flex; gap: 8px; margin-top: 14px; justify-content: flex-end; }
        .fp-btn {
          padding: 8px 16px; border: none; border-radius: 6px; font-size: 13px;
          font-weight: 500; cursor: pointer; transition: all 0.15s;
        }
        .fp-cancel { background: #21262d; color: #8b949e; border: 1px solid #30363d; }
        .fp-cancel:hover { background: #30363d; color: #e6edf3; }
        .fp-ok { background: #3b82f6; color: #fff; }
        .fp-ok:hover { background: #60a5fa; }
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
        background: #3b82f6; border: none;
        color: #fff; padding: 5px 12px; border-radius: 5px; font-size: 12px;
        font-weight: 500; cursor: pointer; transition: all 0.15s;
      }
      .ft-undo:hover { background: #60a5fa; }
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
    console.error('💧 Fountain: Undo error:', e);
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
    console.error('💧 Fountain: Stats error:', e);
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
    console.error('💧 Fountain: Expansion error:', e);
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
          console.log('💧 Fountain: Regex match', shortcut);
          isExpanding = true;
          const expansion = getConditionalExpansion(macro);
          performExpansion(element, match[0], expansion, macro, match);
          return true;
        }
      } catch (e) {
        console.warn('💧 Fountain: Invalid regex:', shortcut);
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
        console.log('💧 Fountain: Expanding', matched);
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
        border-left: 2px solid #3b82f6;
      }
      .fs-shortcut {
        font-family: 'JetBrains Mono', Consolas, monospace;
        font-size: 12px;
        font-weight: 500;
        color: #3b82f6;
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

// Auto-correct functionality
function checkAutoCorrect(element, text) {
  if (!settings.autoCorrect || isExpanding) return false;
  
  // Get the last word
  const words = text.split(/\s+/);
  const lastWord = words[words.length - 1]?.toLowerCase();
  
  if (!lastWord || lastWord.length < 2) return false;
  
  // Check custom corrections first, then built-in
  const correction = autoCorrections[lastWord] || COMMON_TYPOS[lastWord];
  
  if (correction) {
    const oldValue = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA'
      ? element.value
      : element.textContent || '';
    
    // Replace the typo with correction
    const before = oldValue.substring(0, oldValue.length - lastWord.length);
    const newValue = before + correction;
    
    // Save undo state
    const undoState = { element, oldValue, shortcut: lastWord, timestamp: Date.now() };
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.value = newValue;
      element.selectionStart = element.selectionEnd = newValue.length;
    } else {
      element.textContent = newValue;
    }
    
    element.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Save history for undo
    expansionHistory.unshift(undoState);
    if (expansionHistory.length > MAX_HISTORY) expansionHistory.pop();
    
    // Show subtle correction toast
    showCorrectionToast(lastWord, correction, undoState);
    
    return true;
  }
  
  return false;
}

function showCorrectionToast(typo, correction, undoState) {
  const existing = document.querySelector('.fountain-correction-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'fountain-correction-toast';
  toast.innerHTML = `
    <style>
      .fountain-correction-toast {
        position: fixed; bottom: 16px; right: 16px; z-index: 2147483646;
        background: #161b22; border: 1px solid #30363d;
        color: #8b949e; padding: 8px 12px; border-radius: 6px;
        display: flex; align-items: center; gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: ftSlide 0.2s ease-out;
      }
      @keyframes ftSlide { from { transform: translateY(10px); opacity: 0; } }
      .fct-text { color: #6e7681; }
      .fct-typo { text-decoration: line-through; color: #f85149; }
      .fct-correct { color: #3fb950; font-weight: 500; }
      .fct-undo {
        background: transparent; border: 1px solid #30363d;
        color: #8b949e; padding: 3px 8px; border-radius: 4px;
        font-size: 11px; cursor: pointer;
      }
      .fct-undo:hover { background: #21262d; color: #e6edf3; }
    </style>
    <span class="fct-text">Corrected:</span>
    <span class="fct-typo">${escapeHtml(typo)}</span>
    <span class="fct-text">→</span>
    <span class="fct-correct">${escapeHtml(correction)}</span>
    <button class="fct-undo">Undo</button>
  `;
  
  document.body.appendChild(toast);
  
  toast.querySelector('.fct-undo').addEventListener('click', () => {
    undoExpansion(undoState);
    toast.remove();
  });
  
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3000);
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
      // Try macro expansion first
      const expanded = expandMacro(el, lastValue, true);
      if (expanded && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        e.stopPropagation();
      } else if (!expanded && e.key === ' ') {
        // Try auto-correct on space
        checkAutoCorrect(el, lastValue);
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

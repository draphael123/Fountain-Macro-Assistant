// Fountain - Macro Assistant v3.0 - Feature-rich popup
// With: favorites, regex, JS snippets, packages, heatmap, onboarding, and more

let macros = [];
let folders = [];
let macroStats = {};
let counters = {};
let trash = []; // Recently deleted macros
let autoCorrections = {}; // Auto-correct typo mappings
let currentEditingId = null;
let selectedFolderId = 'all';
let sortBy = 'name';
let selectedMacros = new Set();
let currentDomains = [];
let currentBlacklist = [];
let draggedItem = null;
let lightMode = false;
let isFirstRun = false;
let onboardingStep = 0;
const TRASH_RETENTION_DAYS = 30;

// Templates
const TEMPLATES = [
  { icon: '📧', title: 'Email Signature', desc: 'Professional sign-off', shortcut: '/sig', expansion: 'Best regards,\n{input:Your Name}\n{input:Title} | {input:Company}', category: 'signature' },
  { icon: '💼', title: 'Professional Signature', desc: 'Formal business signature', shortcut: '/sigpro', expansion: 'Best regards,\n{input:Your Name}\n{input:Title}\n{input:Company}\nEmail: {input:Email}', category: 'signature' },
  { icon: '👋', title: 'Casual Signature', desc: 'Friendly sign-off', shortcut: '/sigcasual', expansion: 'Thanks!\n{input:Your Name}\n{input:Email}', category: 'signature' },
  { icon: '✍️', title: 'Formal Signature', desc: 'Very formal signature', shortcut: '/sigformal', expansion: 'Sincerely,\n{input:Your Name}\n{input:Title}\n{input:Company}', category: 'signature' },
  { icon: '📅', title: 'Meeting Request', desc: 'Quick meeting invite', shortcut: '/meet', expansion: 'Hi {input:Name},\n\nWould you be available for a meeting on {input:Date}?\n\n{cursor}' },
  { icon: '👋', title: 'Smart Greeting', desc: 'Time-based hello', shortcut: '/greet', expansion: 'Hello!', conditions: { expansions: [{ expansion: 'Good morning! ☀️', timeRange: { start: 0, end: 12 }}, { expansion: 'Good afternoon! 🌤️', timeRange: { start: 12, end: 18 }}, { expansion: 'Good evening! 🌙', timeRange: { start: 18, end: 24 }}]}},
  { icon: '🙏', title: 'Thank You', desc: 'Appreciation message', shortcut: '/ty', expansion: 'Thank you so much! I really appreciate your help. 🙏' },
  { icon: '📞', title: 'Contact Info', desc: 'Your details', shortcut: '/contact', expansion: '📧 {input:Email}\n📱 {input:Phone}\n🌐 {input:Website}' },
  { icon: '📍', title: 'Address', desc: 'Full address', shortcut: '/addr', expansion: '{input:Street}\n{input:City}, {input:State} {input:ZIP}' },
  { icon: '💻', title: 'Code TODO', desc: 'Dev comment', shortcut: '//todo', expansion: '// TODO [{date:YYYY-MM-DD}]: {input:Description} - {cursor}' },
  { icon: '📝', title: 'Quick Note', desc: 'Timestamped note', shortcut: '/note', expansion: '📝 Note ({datetime})\n─────────────────\n{cursor}\n─────────────────' },
  { icon: '🔢', title: 'Invoice Number', desc: 'Auto-incrementing', shortcut: '/inv', expansion: 'INV-{date:YYYYMMDD}-{counter:invoice}' },
  { icon: '🎲', title: 'Random Greeting', desc: 'Varied hellos', shortcut: '/hi', expansion: '{random:Hey there!|Hello!|Hi!|Howdy!|Greetings!} 👋' },
  { icon: '🔗', title: 'GitHub Issue', desc: 'Issue link (regex)', shortcut: '/issue-(\\d+)', expansion: 'https://github.com/org/repo/issues/$1', isRegex: true },
  { icon: '📆', title: 'Today\'s Date', desc: 'Formatted date', shortcut: '/today', expansion: '{js:new Date().toLocaleDateString("en-US", {weekday: "long", year: "numeric", month: "long", day: "numeric"})}' }
];

// Packages
const PACKAGES = [
  { icon: '💼', name: 'Business Pro', desc: 'Professional email templates', count: 15, author: 'Fountain' },
  { icon: '💻', name: 'Developer Kit', desc: 'Code snippets & comments', count: 25, author: 'Fountain' },
  { icon: '📱', name: 'Social Media', desc: 'Hashtags & responses', count: 20, author: 'Fountain' },
  { icon: '🎓', name: 'Academic', desc: 'Citations & formatting', count: 12, author: 'Fountain' },
  { icon: '🛒', name: 'E-commerce', desc: 'Customer support replies', count: 18, author: 'Fountain' }
];

// Onboarding steps
const ONBOARDING_STEPS = [
  { icon: '💧', title: 'Welcome to Fountain!', text: 'Type shortcuts that magically expand into longer text. Save time, type less, do more!' },
  { icon: '✨', title: 'Create Your First Macro', text: 'Click the "✨ New" button to create a shortcut. Try something like /email → your full email address.' },
  { icon: '🎯', title: 'Smart Variables', text: 'Use {cursor} to position your cursor, {input:Name} to prompt for values, and {date} for timestamps!' },
  { icon: '🚀', title: 'You\'re Ready!', text: 'Type your shortcut + Space anywhere on the web and watch the magic happen! ✨' }
];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  loadViewMode();
  setupEventListeners();
  checkFirstRun();
  checkPendingMacro();
});

// Check for pending macro from context menu
async function checkPendingMacro() {
  try {
    const result = await chrome.storage.local.get(['pendingMacro']);
    if (result.pendingMacro) {
      await chrome.storage.local.remove('pendingMacro');
      
      const pending = result.pendingMacro;
      openAddMacro();
      
      if (pending.expansion) {
        document.getElementById('expansionInput').value = pending.expansion;
      }
      
      if (pending.source === 'clipboard') {
        try {
          const clip = await navigator.clipboard.readText();
          if (clip) {
            document.getElementById('expansionInput').value = clip;
          }
        } catch (e) {}
      }
    }
  } catch (e) {
    console.error('Pending macro error:', e);
  }
}

// Load all data
async function loadData() {
  try {
    const result = await chrome.storage.sync.get(['macros', 'folders', 'macroStats', 'counters', 'lightMode', 'hasOnboarded', 'autoCorrections']);
    const localResult = await chrome.storage.local.get(['trash']);
    
    macros = result.macros || [];
    folders = result.folders || [];
    macroStats = result.macroStats || {};
    counters = result.counters || {};
    lightMode = result.lightMode || false;
    isFirstRun = !result.hasOnboarded;
    autoCorrections = result.autoCorrections || {};
    trash = localResult.trash || [];
    
    // Clean up old trash items
    cleanupTrash();
    
    applyTheme();
    updateFolderSelects();
    updateQuickStats();
    renderPinnedMacros();
    renderFavorites();
    renderRecentMacros();
    renderDomainSuggestions();
    renderMacros();
    generateHeatmap();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Save macros
async function saveMacros() {
  await chrome.storage.sync.set({ macros });
  updateQuickStats();
  renderPinnedMacros();
  renderFavorites();
  renderRecentMacros();
  renderMacros();
}

// Save folders
async function saveFolders() {
  await chrome.storage.sync.set({ folders });
  updateFolderSelects();
  renderMacros();
}

// Theme
function applyTheme() {
  document.body.classList.toggle('light-mode', lightMode);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = lightMode ? '🌙' : '☀️';
}

async function toggleTheme() {
  lightMode = !lightMode;
  applyTheme();
  await chrome.storage.sync.set({ lightMode });
}

// Check first run
function checkFirstRun() {
  if (isFirstRun) {
    showOnboarding();
  }
}

// Onboarding
function showOnboarding() {
  onboardingStep = 0;
  updateOnboardingContent();
  document.getElementById('onboardingOverlay').style.display = 'flex';
}

function updateOnboardingContent() {
  const step = ONBOARDING_STEPS[onboardingStep];
  document.querySelector('.onboarding-title').textContent = step.title;
  document.getElementById('onboardingText').textContent = step.text;
  
  document.querySelectorAll('.onboarding-step').forEach((el, i) => {
    el.classList.toggle('active', i === onboardingStep);
  });
  
  const nextBtn = document.getElementById('onboardingNext');
  nextBtn.textContent = onboardingStep === ONBOARDING_STEPS.length - 1 ? 'Get Started! 🚀' : 'Next →';
}

function nextOnboardingStep() {
  if (onboardingStep < ONBOARDING_STEPS.length - 1) {
    onboardingStep++;
    updateOnboardingContent();
  } else {
    closeOnboarding();
  }
}

async function closeOnboarding() {
  document.getElementById('onboardingOverlay').style.display = 'none';
  await chrome.storage.sync.set({ hasOnboarded: true });
  isFirstRun = false;
}

// Folder selects
function updateFolderSelects() {
  const options = folders.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('');
  
  ['folderSelect', 'folderFilter', 'bulkFolderSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const defaultOpt = id === 'folderFilter' ? '<option value="all">All</option>' : '<option value="">No Folder</option>';
      el.innerHTML = defaultOpt + options;
    }
  });
  
  if (selectedFolderId !== 'all') {
    const filter = document.getElementById('folderFilter');
    if (filter) filter.value = selectedFolderId;
  }
}

// Quick stats
function updateQuickStats() {
  document.getElementById('totalMacros').textContent = macros.length;
  
  let totalExpansions = 0;
  let totalCharsSaved = 0;
  
  Object.values(macroStats).forEach(s => totalExpansions += s.count || 0);
  macros.forEach(m => {
    const stat = macroStats[m.id] || { count: 0 };
    totalCharsSaved += Math.max(0, (m.expansion.length - m.shortcut.length) * stat.count);
  });
  
  document.getElementById('totalExpansions').textContent = totalExpansions.toLocaleString();
  
  const mins = Math.round(totalCharsSaved / 200);
  document.getElementById('timeSaved').textContent = mins >= 60 ? `${Math.round(mins/60)}h` : `${mins}m`;
}

// Pinned macros
const MAX_PINNED = 5;

function renderPinnedMacros() {
  const container = document.getElementById('pinnedMacros');
  const section = document.getElementById('pinnedSection');
  const countEl = document.getElementById('pinnedCount');
  
  const pinned = macros.filter(m => m.pinned);
  
  if (countEl) {
    countEl.textContent = `${pinned.length}/${MAX_PINNED}`;
  }
  
  if (pinned.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  container.innerHTML = pinned.map(m => {
    const stats = macroStats[m.id] || { count: 0 };
    const preview = m.expansion.substring(0, 40) + (m.expansion.length > 40 ? '...' : '');
    return `
      <div class="pinned-macro-card" data-id="${m.id}" title="${escapeHtml(m.expansion.substring(0, 100))}">
        <div class="pinned-macro-header">
          <span class="pinned-icon">📌</span>
          <span class="pinned-shortcut">${escapeHtml(m.shortcut)}</span>
          <button class="unpin-btn" data-id="${m.id}" title="Unpin">✕</button>
        </div>
        <div class="pinned-macro-preview">${escapeHtml(preview)}</div>
        ${stats.count > 0 ? `<div class="pinned-macro-stats">⚡ ${stats.count}x</div>` : ''}
      </div>
    `;
  }).join('');
  
  // Click to edit
  container.querySelectorAll('.pinned-macro-card').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('unpin-btn')) return;
      editMacro(el.dataset.id);
    });
  });
  
  // Unpin button
  container.querySelectorAll('.unpin-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const macro = macros.find(m => m.id === btn.dataset.id);
      if (macro) {
        macro.pinned = false;
        await saveMacros();
        showToast('Macro unpinned', 'success');
      }
    });
  });
}

// Favorites
function renderFavorites() {
  const container = document.getElementById('favoritesMacros');
  const section = document.getElementById('favoritesSection');
  
  const favorites = macros.filter(m => m.favorited);
  
  if (favorites.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  container.innerHTML = favorites.slice(0, 5).map(m => `
    <div class="recent-macro-chip" data-id="${m.id}">
      <span class="star">⭐</span>
      <span class="shortcut">${escapeHtml(m.shortcut)}</span>
    </div>
  `).join('');
  
  container.querySelectorAll('.recent-macro-chip').forEach(el => {
    el.addEventListener('click', () => editMacro(el.dataset.id));
  });
}

// Recent macros
function renderRecentMacros() {
  const container = document.getElementById('recentMacros');
  const section = document.getElementById('recentSection');
  
  const recent = macros
    .filter(m => macroStats[m.id]?.lastUsed && !m.favorited)
    .sort((a, b) => (macroStats[b.id]?.lastUsed || 0) - (macroStats[a.id]?.lastUsed || 0))
    .slice(0, 5);
  
  if (recent.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  container.innerHTML = recent.map(m => {
    const stat = macroStats[m.id] || { count: 0 };
    return `
      <div class="recent-macro-chip" data-id="${m.id}" title="${escapeHtml(m.expansion.substring(0, 50))}">
        <span class="shortcut">${escapeHtml(m.shortcut)}</span>
        <span class="usage">${stat.count}x</span>
      </div>
    `;
  }).join('');
  
  container.querySelectorAll('.recent-macro-chip').forEach(el => {
    el.addEventListener('click', () => editMacro(el.dataset.id));
  });
}

// Domain Suggestions
async function renderDomainSuggestions() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    
    const url = new URL(tab.url);
    const domain = url.hostname.replace('www.', '');
    const section = document.getElementById('domainSuggestionsSection');
    const container = document.getElementById('suggestedMacros');
    const domainName = document.getElementById('currentDomainName');
    
    // Find macros that match this domain
    const suggested = macros.filter(m => 
      m.enabled !== false &&
      (m.domains || []).some(d => domain.includes(d) || d.includes(domain))
    ).slice(0, 5);
    
    if (suggested.length === 0) {
      section.style.display = 'none';
      return;
    }
    
    section.style.display = 'block';
    domainName.textContent = domain;
    container.innerHTML = suggested.map(m => `
      <div class="suggested-macro-chip" data-id="${m.id}" title="${escapeHtml(m.expansion.substring(0, 50))}">
        <span class="shortcut">${escapeHtml(m.shortcut)}</span>
        <span class="indicator">🌐</span>
      </div>
    `).join('');
    
    container.querySelectorAll('.suggested-macro-chip').forEach(el => {
      el.addEventListener('click', () => editMacro(el.dataset.id));
    });
  } catch (e) {
    console.error('Domain suggestions error:', e);
  }
}

// Sample Macros
async function addSampleMacros() {
  const samples = [
    { shortcut: '/email', expansion: 'your.email@example.com', tags: ['contact'] },
    { shortcut: '/sig', expansion: 'Best regards,\nYour Name', tags: ['signature'] },
    { shortcut: '/date', expansion: '{date:YYYY-MM-DD}', tags: ['date-time'] },
    { shortcut: '/time', expansion: '{time:HH:mm}', tags: ['date-time'] },
    { shortcut: '/phone', expansion: '(555) 123-4567', tags: ['contact'] }
  ];
  
  let added = 0;
  samples.forEach(sample => {
    if (!macros.some(m => m.shortcut === sample.shortcut)) {
      macros.push({
        id: Date.now().toString() + Math.random(),
        shortcut: sample.shortcut,
        expansion: sample.expansion,
        tags: sample.tags || [],
        enabled: true,
        createdAt: new Date().toISOString()
      });
      added++;
    }
  });
  
  if (added > 0) {
    await saveMacros();
    showToast(`Added ${added} sample macros! 🎉`, 'success');
    renderMacros();
  } else {
    showToast('Sample macros already exist', 'info');
  }
}

// Render macros
function renderMacros(filter = '') {
  const list = document.getElementById('macrosList');
  const empty = document.getElementById('emptyState');
  
  let filtered = macros.filter(m => {
    const matchesSearch = !filter || 
      fuzzySearch(filter, m.shortcut) ||
      fuzzySearch(filter, m.expansion) ||
      (m.aliases || []).some(a => fuzzySearch(filter, a)) ||
      (m.tags || []).some(t => fuzzySearch(filter, t));
    
    const matchesFolder = selectedFolderId === 'all' || 
      (selectedFolderId === '' && !m.folderId) ||
      m.folderId === selectedFolderId;
    
    // Apply active filters
    let matchesFilters = true;
    activeFilters.forEach(f => {
      if (f === 'pinned' && !m.pinned) matchesFilters = false;
      if (f === 'favorites' && !m.favorited) matchesFilters = false;
      if (f === 'recent' && (!macroStats[m.id] || !macroStats[m.id].lastUsed)) matchesFilters = false;
      if (f.startsWith('tag:') && !(m.tags || []).includes(f.replace('tag:', ''))) matchesFilters = false;
    });
    
    return matchesSearch && matchesFolder && matchesFilters;
  });
  
  filtered = sortMacros(filtered);
  
  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  
  empty.classList.add('hidden');
  
  // Group by folder
  const byFolder = {};
  const noFolder = [];
  
  filtered.forEach(m => {
    if (m.folderId) {
      if (!byFolder[m.folderId]) byFolder[m.folderId] = [];
      byFolder[m.folderId].push(m);
    } else {
      noFolder.push(m);
    }
  });
  
  // Apply view mode
  list.className = `macros-list view-${currentViewMode}`;
  
  let html = '';
  
  // For grid/compact views, don't group by folder
  if (currentViewMode === 'grid' || currentViewMode === 'compact') {
    html = filtered.map(m => renderMacroItem(m, filter)).join('');
  } else {
    // Render folders (list view)
    Object.keys(byFolder).forEach(folderId => {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return;
      
      html += `
        <div class="folder-section">
          <div class="folder-header">
            <span class="folder-icon" style="color: ${folder.color || '#c44eff'}">📁</span>
            <span class="folder-name">${escapeHtml(folder.name)}</span>
            <span class="folder-count">${byFolder[folderId].length}</span>
          </div>
          <div class="folder-macros">
            ${byFolder[folderId].map(m => renderMacroItem(m, filter)).join('')}
          </div>
        </div>
      `;
    });
    
    // Unfiled macros
    if (noFolder.length > 0 && (selectedFolderId === 'all' || selectedFolderId === '')) {
      html += `
        <div class="folder-section">
          <div class="folder-header">
            <span class="folder-icon">📄</span>
            <span class="folder-name">Unfiled</span>
            <span class="folder-count">${noFolder.length}</span>
          </div>
          <div class="folder-macros">
            ${noFolder.map(m => renderMacroItem(m, filter)).join('')}
          </div>
        </div>
      `;
    }
  }
  
  list.innerHTML = html;
  setupMacroListeners();
  setupContextMenu();
  setupDragAndDrop();
  
  // Update search suggestions
  updateSearchSuggestions(filter);
}

// Context Menu
let contextMenuMacroId = null;

function setupContextMenu() {
  document.addEventListener('click', () => hideContextMenu());
  document.getElementById('contextMenu')?.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      handleContextAction(item.dataset.action);
    });
  });
}

function showContextMenu(x, y, macroId) {
  contextMenuMacroId = macroId;
  const menu = document.getElementById('contextMenu');
  menu.style.display = 'block';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  
  // Adjust if off-screen
  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) menu.style.left = `${x - rect.width}px`;
  if (rect.bottom > window.innerHeight) menu.style.top = `${y - rect.height}px`;
  
  // Update favorite button state
  const macro = macros.find(m => m.id === macroId);
  const favBtn = menu.querySelector('[data-action="favorite"]');
  if (favBtn && macro) {
    favBtn.querySelector('span').textContent = macro.favorited ? '⭐ Unfavorite' : '⭐ Favorite';
  }
  
  // Update pin button state
  const pinBtn = menu.querySelector('[data-action="pin"]');
  if (pinBtn && macro) {
    const pinnedCount = macros.filter(m => m.pinned).length;
    const canPin = macro.pinned || pinnedCount < MAX_PINNED;
    pinBtn.querySelector('span').textContent = macro.pinned ? '📌 Unpin' : '📌 Pin to Top';
    pinBtn.disabled = !canPin && !macro.pinned;
    pinBtn.title = !canPin && !macro.pinned ? `Max ${MAX_PINNED} pinned macros` : '';
  }
}

function hideContextMenu() {
  const menu = document.getElementById('contextMenu');
  if (menu) menu.style.display = 'none';
  contextMenuMacroId = null;
}

async function handleContextAction(action) {
  if (!contextMenuMacroId) return;
  const macro = macros.find(m => m.id === contextMenuMacroId);
  if (!macro) return;
  
  switch(action) {
    case 'edit':
      editMacro(contextMenuMacroId);
      break;
    case 'duplicate':
      duplicateMacroById(contextMenuMacroId);
      break;
    case 'favorite':
      macro.favorited = !macro.favorited;
      await saveMacros();
      showToast(macro.favorited ? 'Added to favorites' : 'Removed from favorites', 'success');
      break;
    case 'pin':
      const pinnedCount = macros.filter(m => m.pinned).length;
      if (macro.pinned) {
        macro.pinned = false;
        await saveMacros();
        showToast('Macro unpinned', 'success');
      } else if (pinnedCount < MAX_PINNED) {
        macro.pinned = true;
        await saveMacros();
        showToast('Macro pinned to top!', 'success');
      } else {
        showToast(`Max ${MAX_PINNED} pinned macros allowed`, 'warning');
      }
      break;
    case 'copy-shortcut':
      navigator.clipboard.writeText(macro.shortcut);
      showToast('Shortcut copied!', 'success');
      break;
    case 'copy-expansion':
      navigator.clipboard.writeText(macro.expansion);
      showToast('Expansion copied!', 'success');
      break;
    case 'delete':
      if (confirm('Delete this macro?')) {
        await deleteMacroById(contextMenuMacroId);
      }
      break;
  }
  hideContextMenu();
  renderMacros();
}

function duplicateMacroById(macroId) {
  const macro = macros.find(m => m.id === macroId);
  if (!macro) return;
  
  const duplicate = {
    ...macro,
    id: Date.now().toString(),
    shortcut: macro.shortcut + '-copy',
    createdAt: new Date().toISOString()
  };
  
  macros.push(duplicate);
  saveMacros();
  showToast('Macro duplicated!', 'success');
  renderMacros();
}

async function deleteMacroById(macroId) {
  macros = macros.filter(m => m.id !== macroId);
  await saveMacros();
  showToast('Macro deleted', 'success');
  renderMacros();
}

// Render single macro item
function renderMacroItem(macro, filter = '') {
  const stats = macroStats[macro.id] || { count: 0 };
  const isSelected = selectedMacros.has(macro.id);
  const isEnabled = macro.enabled !== false;
  const isFavorite = macro.favorited;
  const isPinned = macro.pinned;
  const isRecent = stats.lastUsed && (Date.now() - stats.lastUsed < 86400000); // Last 24h
  
  const shortcutDisplay = filter ? highlight(macro.shortcut, filter) : escapeHtml(macro.shortcut);
  const preview = macro.expansion.substring(0, 80) + (macro.expansion.length > 80 ? '...' : '');
  
  const indicators = [];
  if (macro.pinned) indicators.push('<span class="indicator pinned" title="Pinned">📌</span>');
  if (macro.aliases?.length) indicators.push('<span class="indicator alias" title="Has aliases">🔗</span>');
  if (macro.conditions && Object.keys(macro.conditions).length) indicators.push('<span class="indicator condition" title="Conditional">⚡</span>');
  if (macro.domains?.length) indicators.push('<span class="indicator domain" title="Domain filter">🌐</span>');
  if (macro.isRegex) indicators.push('<span class="indicator regex" title="Regex pattern">🎯</span>');
  if (macro.expansion.includes('{js:')) indicators.push('<span class="indicator js" title="JavaScript">💻</span>');
  
  const viewClass = currentViewMode === 'grid' ? 'macro-card' : currentViewMode === 'compact' ? 'macro-compact' : 'macro-item';
  
  if (currentViewMode === 'grid') {
    return `
      <div class="${viewClass} ${isSelected ? 'selected' : ''} ${!isEnabled ? 'disabled' : ''} ${isFavorite ? 'favorited' : ''} ${isPinned ? 'pinned' : ''} ${isRecent ? 'recent' : ''}" 
           data-macro-id="${macro.id}" data-id="${macro.id}" draggable="true" role="listitem"
           aria-label="Macro ${escapeHtml(macro.shortcut)}">
        <div class="macro-card-header">
          <input type="checkbox" class="macro-checkbox" ${isSelected ? 'checked' : ''} data-id="${macro.id}" aria-label="Select macro">
          ${isPinned ? '<span class="pin-indicator" title="Pinned">📌</span>' : ''}
          <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${macro.id}" title="${isFavorite ? 'Unfavorite' : 'Favorite'}" aria-label="${isFavorite ? 'Unfavorite' : 'Favorite'}">⭐</button>
        </div>
        <div class="macro-card-shortcut">${shortcutDisplay}</div>
        <div class="macro-card-preview">${escapeHtml(preview)}</div>
        <div class="macro-card-indicators">${indicators.join('')}</div>
        <div class="macro-card-stats">${stats.count > 0 ? `<span>${stats.count}x</span>` : ''}</div>
        <div class="macro-card-actions">
          <button class="quick-action-btn" data-action="copy" data-id="${macro.id}" title="Copy shortcut">📝</button>
          <button class="quick-action-btn" data-action="edit" data-id="${macro.id}" title="Edit">✏️</button>
        </div>
      </div>
    `;
  }
  
  if (currentViewMode === 'compact') {
    return `
      <div class="${viewClass} ${isSelected ? 'selected' : ''} ${!isEnabled ? 'disabled' : ''} ${isFavorite ? 'favorited' : ''} ${isPinned ? 'pinned' : ''}" 
           data-macro-id="${macro.id}" data-id="${macro.id}" draggable="true" role="listitem">
        <input type="checkbox" class="macro-checkbox" ${isSelected ? 'checked' : ''} data-id="${macro.id}">
        ${isPinned ? '<span class="pin-indicator-compact">📌</span>' : ''}
        <span class="macro-shortcut-compact">${shortcutDisplay}</span>
        <span class="macro-preview-compact">${escapeHtml(preview)}</span>
        ${isFavorite ? '<span class="favorite-indicator">⭐</span>' : ''}
        ${stats.count > 0 ? `<span class="usage-count">${stats.count}</span>` : ''}
      </div>
    `;
  }
  
  return `
    <div class="${viewClass} ${isSelected ? 'selected' : ''} ${!isEnabled ? 'disabled' : ''} ${isFavorite ? 'favorited' : ''} ${isPinned ? 'pinned' : ''} ${isRecent ? 'recent' : ''}" 
         data-macro-id="${macro.id}" data-id="${macro.id}" draggable="true" role="listitem"
         aria-label="Macro ${escapeHtml(macro.shortcut)}">
      <div class="macro-header">
        <div class="macro-header-left">
          <input type="checkbox" class="macro-checkbox" ${isSelected ? 'checked' : ''} data-id="${macro.id}">
          <span class="drag-handle">⠿</span>
          <div class="macro-shortcut">
            ${isPinned ? '<span class="pin-badge">📌</span>' : ''}
            ${shortcutDisplay}
            <div class="macro-indicators">${indicators.join('')}</div>
          </div>
        </div>
        <div class="macro-header-right">
          ${stats.count > 0 ? `<span class="usage-badge">⚡${stats.count}</span>` : ''}
          <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${macro.id}" title="Favorite">
            ${isFavorite ? '⭐' : '☆'}
          </button>
          <div class="toggle-switch ${isEnabled ? 'active' : ''}" data-id="${macro.id}"></div>
        </div>
      </div>
      <div class="macro-expansion">${filter ? highlight(preview, filter) : escapeHtml(preview)}</div>
      ${macro.tags?.length ? `<div class="macro-tags">${macro.tags.map(t => `<span class="tag-badge">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      <div class="expansion-preview">
        <div class="expansion-preview-title">Full Expansion</div>
        <div class="expansion-preview-content">${escapeHtml(macro.expansion)}</div>
      </div>
    </div>
  `;
}

// Setup macro event listeners
function setupMacroListeners() {
  document.querySelectorAll('[data-macro-id]').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.classList.contains('macro-checkbox') || 
          e.target.classList.contains('toggle-switch') ||
          e.target.classList.contains('favorite-btn') ||
          e.target.classList.contains('drag-handle') ||
          e.target.classList.contains('quick-action-btn')) return;
      editMacro(el.dataset.macroId);
    });
    
    // Right-click context menu
    el.addEventListener('contextmenu', e => {
      e.preventDefault();
      showContextMenu(e.pageX, e.pageY, el.dataset.macroId);
    });
    
    // Hover preview for grid view
    if (currentViewMode === 'grid') {
      el.addEventListener('mouseenter', () => {
        showHoverPreview(el, el.dataset.macroId);
      });
      el.addEventListener('mouseleave', () => {
        hideHoverPreview();
      });
    }
    
    // Drag & drop
    el.addEventListener('dragstart', handleDragStart);
    el.addEventListener('dragend', handleDragEnd);
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('drop', handleDrop);
    el.addEventListener('dragleave', e => e.currentTarget.classList.remove('drag-over'));
  });
  
  // Quick action buttons
  document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const macroId = btn.dataset.id;
      const action = btn.dataset.action;
      
      if (action === 'copy') {
        const macro = macros.find(m => m.id === macroId);
        if (macro) {
          await navigator.clipboard.writeText(macro.shortcut);
          showToast('Shortcut copied!', 'success');
        }
      } else if (action === 'edit') {
        editMacro(macroId);
      }
    });
  });
  
  // Checkboxes
  document.querySelectorAll('.macro-checkbox').forEach(cb => {
    cb.addEventListener('change', e => {
      e.stopPropagation();
      const id = cb.dataset.id;
      if (cb.checked) selectedMacros.add(id);
      else selectedMacros.delete(id);
      updateBulkActions();
      cb.closest('.macro-item').classList.toggle('selected', cb.checked);
    });
  });
  
  // Toggle switches
  document.querySelectorAll('.toggle-switch').forEach(sw => {
    sw.addEventListener('click', async e => {
      e.stopPropagation();
      const macro = macros.find(m => m.id === sw.dataset.id);
      if (macro) {
        macro.enabled = !sw.classList.contains('active');
        await saveMacros();
      }
    });
  });
  
  // Favorite buttons
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const macro = macros.find(m => m.id === btn.dataset.id);
      if (macro) {
        macro.favorited = !macro.favorited;
        await saveMacros();
        showToast(macro.favorited ? 'Added to favorites ⭐' : 'Removed from favorites', 'success');
      }
    });
  });
}

// Drag handlers
function handleDragStart(e) {
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.macro-item').forEach(el => el.classList.remove('drag-over'));
  draggedItem = null;
}

function handleDragOver(e) {
  e.preventDefault();
  if (draggedItem !== this) this.classList.add('drag-over');
}

async function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  if (draggedItem === this) return;
  
  const draggedId = e.dataTransfer.getData('text/plain');
  const targetId = this.dataset.id;
  
  const di = macros.findIndex(m => m.id === draggedId);
  const ti = macros.findIndex(m => m.id === targetId);
  
  if (di !== -1 && ti !== -1) {
    const [moved] = macros.splice(di, 1);
    macros.splice(ti, 0, moved);
    
    // Match folder
    const target = macros.find(m => m.id === targetId);
    if (target) moved.folderId = target.folderId;
    
    await saveMacros();
  }
}

// Bulk actions
function updateBulkActions() {
  const bulk = document.getElementById('bulkActions');
  const count = document.getElementById('selectedCount');
  
  if (selectedMacros.size > 0) {
    bulk.classList.add('active');
    count.textContent = selectedMacros.size;
  } else {
    bulk.classList.remove('active');
  }
}

function clearSelection() {
  selectedMacros.clear();
  updateBulkActions();
  document.querySelectorAll('.macro-checkbox').forEach(cb => cb.checked = false);
  document.querySelectorAll('.macro-item').forEach(el => el.classList.remove('selected'));
}

async function bulkDelete() {
  if (!selectedMacros.size) return;
  if (confirm(`Delete ${selectedMacros.size} macro(s)?`)) {
    macros = macros.filter(m => !selectedMacros.has(m.id));
    clearSelection();
    await saveMacros();
    showToast('Macros deleted', 'success');
  }
}

async function bulkFavorite() {
  macros.forEach(m => {
    if (selectedMacros.has(m.id)) m.favorited = true;
  });
  clearSelection();
  await saveMacros();
  showToast('Added to favorites ⭐', 'success');
}

async function bulkPin() {
  const currentPinnedCount = macros.filter(m => m.pinned).length;
  const selectedCount = selectedMacros.size;
  const alreadyPinnedSelected = macros.filter(m => selectedMacros.has(m.id) && m.pinned).length;
  const newPinsNeeded = selectedCount - alreadyPinnedSelected;
  
  if (currentPinnedCount + newPinsNeeded > MAX_PINNED) {
    showToast(`Can only pin ${MAX_PINNED} macros. ${MAX_PINNED - currentPinnedCount} slots available.`, 'warning');
    return;
  }
  
  macros.forEach(m => {
    if (selectedMacros.has(m.id)) m.pinned = true;
  });
  clearSelection();
  await saveMacros();
  showToast('Pinned selected macros 📌', 'success');
}

async function bulkMove(folderId) {
  macros.forEach(m => {
    if (selectedMacros.has(m.id)) m.folderId = folderId || null;
  });
  clearSelection();
  await saveMacros();
  closeModal('bulkMoveModal');
  showToast('Macros moved', 'success');
}

function bulkExport() {
  const selected = macros.filter(m => selectedMacros.has(m.id));
  downloadJSON(selected, 'fountain-export');
  clearSelection();
}

// Macro modal
function openAddMacro() {
  currentEditingId = null;
  currentDomains = [];
  currentBlacklist = [];
  
  document.getElementById('modalTitle').textContent = '✨ New Macro';
  document.getElementById('shortcutInput').value = '';
  document.getElementById('aliasesInput').value = '';
  document.getElementById('tagsInput').value = '';
  document.getElementById('expansionInput').value = '';
  document.getElementById('caseSensitiveCheck').checked = false;
  document.getElementById('isRegexCheck').checked = false;
  document.getElementById('typewriterCheck').checked = false;
  document.getElementById('enableConditionsCheck').checked = false;
  document.getElementById('showBlacklistCheck').checked = false;
  document.getElementById('timeStart').value = '';
  document.getElementById('timeEnd').value = '';
  document.getElementById('weekdayOnlyCheck').checked = false;
  document.getElementById('conditionsPanel').style.display = 'none';
  document.getElementById('blacklistSection').style.display = 'none';
  document.getElementById('conditionalExpansions').innerHTML = '';
  document.getElementById('folderSelect').value = selectedFolderId !== 'all' ? selectedFolderId : '';
  document.getElementById('deleteMacroBtn').style.display = 'none';
  document.getElementById('duplicateMacroBtn').style.display = 'none';
  document.getElementById('testOutput').textContent = 'Click "Run Test" to preview';
  
  renderDomainTags();
  renderBlacklistTags();
  
  showModal('macroModal');
  document.getElementById('shortcutInput').focus();
}

function editMacro(id) {
  const macro = macros.find(m => m.id === id);
  if (!macro) return;
  
  currentEditingId = id;
  currentDomains = macro.domains ? [...macro.domains] : [];
  currentBlacklist = macro.blacklist ? [...macro.blacklist] : [];
  
  document.getElementById('modalTitle').textContent = '✏️ Edit Macro';
  document.getElementById('shortcutInput').value = macro.shortcut;
  document.getElementById('aliasesInput').value = (macro.aliases || []).join(', ');
  document.getElementById('tagsInput').value = (macro.tags || []).join(', ');
  document.getElementById('expansionInput').value = macro.expansion;
  document.getElementById('caseSensitiveCheck').checked = macro.caseSensitive || false;
  document.getElementById('isRegexCheck').checked = macro.isRegex || false;
  document.getElementById('typewriterCheck').checked = macro.typewriter || false;
  
  const conds = macro.conditions || {};
  const hasConds = conds.timeRange || conds.weekdayOnly || conds.expansions?.length;
  document.getElementById('enableConditionsCheck').checked = hasConds;
  document.getElementById('conditionsPanel').style.display = hasConds ? 'block' : 'none';
  
  document.getElementById('timeStart').value = conds.timeRange?.start ?? '';
  document.getElementById('timeEnd').value = conds.timeRange?.end ?? '';
  document.getElementById('weekdayOnlyCheck').checked = conds.weekdayOnly || false;
  
  document.getElementById('conditionalExpansions').innerHTML = '';
  (conds.expansions || []).forEach(ce => addConditionalRow(ce));
  
  document.getElementById('showBlacklistCheck').checked = currentBlacklist.length > 0;
  document.getElementById('blacklistSection').style.display = currentBlacklist.length > 0 ? 'block' : 'none';
  
  document.getElementById('folderSelect').value = macro.folderId || '';
  document.getElementById('deleteMacroBtn').style.display = 'inline-flex';
  document.getElementById('duplicateMacroBtn').style.display = 'inline-flex';
  
  renderDomainTags();
  renderBlacklistTags();
  
  showModal('macroModal');
}

// Domain/blacklist tags
function renderDomainTags() {
  const container = document.getElementById('domainTags');
  container.innerHTML = currentDomains.map(d => `
    <span class="domain-tag">${escapeHtml(d)} <span class="remove-domain" data-domain="${d}">&times;</span></span>
  `).join('');
  
  container.querySelectorAll('.remove-domain').forEach(btn => {
    btn.addEventListener('click', () => {
      currentDomains = currentDomains.filter(d => d !== btn.dataset.domain);
      renderDomainTags();
    });
  });
}

function renderBlacklistTags() {
  const container = document.getElementById('blacklistTags');
  container.innerHTML = currentBlacklist.map(d => `
    <span class="domain-tag" style="background: rgba(255,71,87,0.2); color: var(--color-red);">${escapeHtml(d)} <span class="remove-blacklist" data-domain="${d}">&times;</span></span>
  `).join('');
  
  container.querySelectorAll('.remove-blacklist').forEach(btn => {
    btn.addEventListener('click', () => {
      currentBlacklist = currentBlacklist.filter(d => d !== btn.dataset.domain);
      renderBlacklistTags();
    });
  });
}

function addDomain() {
  const input = document.getElementById('domainInput');
  const domain = input.value.trim().toLowerCase();
  if (domain && !currentDomains.includes(domain)) {
    currentDomains.push(domain);
    renderDomainTags();
  }
  input.value = '';
}

function addBlacklist() {
  const input = document.getElementById('blacklistInput');
  const domain = input.value.trim().toLowerCase();
  if (domain && !currentBlacklist.includes(domain)) {
    currentBlacklist.push(domain);
    renderBlacklistTags();
  }
  input.value = '';
}

// Save macro
async function saveMacro() {
  const shortcut = document.getElementById('shortcutInput').value.trim();
  const expansion = document.getElementById('expansionInput').value.trim();
  
  if (!shortcut || !expansion) {
    showToast('Please fill in shortcut and expansion', 'error');
    return;
  }
  
  const aliasesRaw = document.getElementById('aliasesInput').value.trim();
  const aliases = aliasesRaw ? aliasesRaw.split(',').map(a => a.trim()).filter(a => a) : [];
  
  const tagsRaw = document.getElementById('tagsInput').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];
  
  // Check duplicates/conflicts
  const allShortcuts = [shortcut, ...aliases];
  const conflicts = checkConflicts(shortcut, currentEditingId);
  const duplicate = macros.find(m => {
    if (m.id === currentEditingId) return false;
    const mShortcuts = [m.shortcut, ...(m.aliases || [])];
    return allShortcuts.some(s => mShortcuts.some(ms => s.toLowerCase() === ms.toLowerCase()));
  });
  
  if (duplicate) {
    showToast('Shortcut already exists!', 'error');
    return;
  }
  
  // Build conditions
  let conditions = {};
  if (document.getElementById('enableConditionsCheck').checked) {
    const ts = document.getElementById('timeStart').value;
    const te = document.getElementById('timeEnd').value;
    if (ts !== '' || te !== '') {
      conditions.timeRange = { start: ts ? parseInt(ts) : undefined, end: te ? parseInt(te) : undefined };
    }
    if (document.getElementById('weekdayOnlyCheck').checked) {
      conditions.weekdayOnly = true;
    }
    
    const condExps = [];
    document.querySelectorAll('.conditional-expansion-row').forEach(row => {
      const exp = row.querySelector('.cond-expansion-input').value.trim();
      if (exp) {
        const ce = { expansion: exp };
        const cts = row.querySelector('.cond-time-start').value;
        const cte = row.querySelector('.cond-time-end').value;
        if (cts || cte) ce.timeRange = { start: cts ? parseInt(cts) : undefined, end: cte ? parseInt(cte) : undefined };
        const day = row.querySelector('.cond-day-select').value;
        if (day !== '') ce.day = parseInt(day);
        if (row.querySelector('.cond-weekday').checked) ce.weekdayOnly = true;
        condExps.push(ce);
      }
    });
    if (condExps.length) conditions.expansions = condExps;
  }
  
  const data = {
    id: currentEditingId || Date.now().toString(),
    shortcut,
    aliases: aliases.length ? aliases : undefined,
    tags: tags.length ? tags : undefined,
    expansion,
    caseSensitive: document.getElementById('caseSensitiveCheck').checked,
    isRegex: document.getElementById('isRegexCheck').checked,
    typewriter: document.getElementById('typewriterCheck').checked,
    folderId: document.getElementById('folderSelect').value || null,
    domains: currentDomains.length ? currentDomains : undefined,
    blacklist: currentBlacklist.length ? currentBlacklist : undefined,
    conditions: Object.keys(conditions).length ? conditions : undefined,
    enabled: true
  };
  
  if (currentEditingId) {
    const idx = macros.findIndex(m => m.id === currentEditingId);
    const existing = macros[idx];
    data.enabled = existing.enabled !== false;
    data.favorited = existing.favorited;
    macros[idx] = data;
  } else {
    macros.push(data);
  }
  
  await saveMacros();
  closeModal('macroModal');
  showToast(currentEditingId ? 'Macro updated! ✨' : 'Macro created! 🎉', 'success');
}

// Duplicate macro
async function duplicateMacro() {
  if (!currentEditingId) return;
  const orig = macros.find(m => m.id === currentEditingId);
  if (!orig) return;
  
  const dup = { ...JSON.parse(JSON.stringify(orig)), id: Date.now().toString(), shortcut: orig.shortcut + '_copy' };
  macros.push(dup);
  await saveMacros();
  closeModal('macroModal');
  showToast('Macro duplicated! 📋', 'success');
  setTimeout(() => editMacro(dup.id), 100);
}

// Delete macro
async function deleteMacro() {
  if (!currentEditingId) return;
  if (confirm('Move this macro to trash? You can restore it within 30 days.')) {
    const macro = macros.find(m => m.id === currentEditingId);
    if (macro) {
      // Move to trash with deletion timestamp
      trash.push({ ...macro, deletedAt: Date.now() });
      await chrome.storage.local.set({ trash });
    }
    macros = macros.filter(m => m.id !== currentEditingId);
    await saveMacros();
    closeModal('macroModal');
    showToast('Moved to trash. Can restore within 30 days.', 'success');
  }
}

// Trash management functions
async function cleanupTrash() {
  const cutoff = Date.now() - (TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const before = trash.length;
  trash = trash.filter(m => m.deletedAt > cutoff);
  if (trash.length !== before) {
    await chrome.storage.local.set({ trash });
  }
}

async function restoreFromTrash(macroId) {
  const idx = trash.findIndex(m => m.id === macroId);
  if (idx === -1) return;
  
  const macro = trash[idx];
  delete macro.deletedAt;
  macros.push(macro);
  trash.splice(idx, 1);
  
  await chrome.storage.local.set({ trash });
  await saveMacros();
  showToast('Macro restored! 🎉', 'success');
}

async function permanentDelete(macroId) {
  if (!confirm('Permanently delete this macro? This cannot be undone.')) return;
  
  trash = trash.filter(m => m.id !== macroId);
  await chrome.storage.local.set({ trash });
  showToast('Permanently deleted', 'success');
  renderTrash();
}

async function emptyTrash() {
  if (!confirm(`Permanently delete all ${trash.length} items in trash? This cannot be undone.`)) return;
  
  trash = [];
  await chrome.storage.local.set({ trash });
  showToast('Trash emptied', 'success');
  closeModal('trashModal');
}

function renderTrash() {
  const container = document.getElementById('trashList');
  const countEl = document.getElementById('trashCount');
  
  if (countEl) countEl.textContent = trash.length;
  if (!container) return;
  
  if (trash.length === 0) {
    container.innerHTML = '<div class="empty-trash">🗑️ Trash is empty</div>';
    return;
  }
  
  container.innerHTML = trash.map(m => {
    const daysAgo = Math.floor((Date.now() - m.deletedAt) / (24 * 60 * 60 * 1000));
    const daysLeft = TRASH_RETENTION_DAYS - daysAgo;
    return `
      <div class="trash-item" data-id="${m.id}">
        <div class="trash-item-info">
          <span class="trash-shortcut">${escapeHtml(m.shortcut)}</span>
          <span class="trash-preview">${escapeHtml(m.expansion.substring(0, 50))}...</span>
          <span class="trash-meta">${daysLeft} days left</span>
        </div>
        <div class="trash-actions">
          <button class="btn btn-sm btn-primary restore-btn" data-id="${m.id}">↩️ Restore</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${m.id}">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Event listeners
  container.querySelectorAll('.restore-btn').forEach(btn => {
    btn.addEventListener('click', () => restoreFromTrash(btn.dataset.id));
  });
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => permanentDelete(btn.dataset.id));
  });
}

function openTrash() {
  renderTrash();
  showModal('trashModal');
}

// === IMPORT FUNCTIONALITY ===
let currentImportType = 'fountain';

function openImport() {
  showModal('importModal');
}

function triggerImport(type) {
  currentImportType = type;
  const input = document.getElementById('importFileInput');
  input.accept = type === 'fountain' ? '.json' : '.csv';
  input.click();
}

async function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    let imported = [];
    
    if (currentImportType === 'fountain') {
      imported = importFountainJSON(text);
    } else if (currentImportType === 'textexpander') {
      imported = importTextExpanderCSV(text);
    } else if (currentImportType === 'atext') {
      imported = importATextCSV(text);
    }
    
    if (imported.length > 0) {
      macros.push(...imported);
      await saveMacros();
      closeModal('importModal');
      showToast(`Imported ${imported.length} macros! 🎉`, 'success');
    } else {
      showToast('No macros found in file', 'error');
    }
  } catch (err) {
    console.error('Import error:', err);
    showToast('Error importing file: ' + err.message, 'error');
  }
  
  e.target.value = ''; // Reset input
}

function importFountainJSON(text) {
  const data = JSON.parse(text);
  const items = data.macros || data;
  
  return (Array.isArray(items) ? items : []).map(m => ({
    ...m,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  }));
}

function importTextExpanderCSV(text) {
  // TextExpander CSV format: abbreviation,plaintext content
  const lines = parseCSV(text);
  const imported = [];
  
  for (let i = 1; i < lines.length; i++) { // Skip header
    const row = lines[i];
    if (row.length >= 2) {
      const shortcut = row[0]?.trim();
      const expansion = row[1]?.trim() || row[2]?.trim(); // Some formats have content in column 2 or 3
      
      if (shortcut && expansion) {
        imported.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          shortcut: shortcut.startsWith('/') ? shortcut : '/' + shortcut,
          expansion: expansion.replace(/\\n/g, '\n'),
          createdAt: new Date().toISOString(),
          tags: ['imported', 'textexpander']
        });
      }
    }
  }
  
  return imported;
}

function importATextCSV(text) {
  // aText CSV format: abbreviation,content
  const lines = parseCSV(text);
  const imported = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (row.length >= 2) {
      const shortcut = row[0]?.trim();
      const expansion = row[1]?.trim();
      
      if (shortcut && expansion) {
        imported.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          shortcut: shortcut.startsWith('/') ? shortcut : '/' + shortcut,
          expansion: expansion.replace(/\\n/g, '\n'),
          createdAt: new Date().toISOString(),
          tags: ['imported', 'atext']
        });
      }
    }
  }
  
  return imported;
}

function parseCSV(text) {
  const lines = [];
  const rows = text.split(/\r?\n/);
  
  for (const row of rows) {
    if (!row.trim()) continue;
    
    const cells = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current);
    lines.push(cells);
  }
  
  return lines;
}

// === AUTO-CORRECT MODE ===
async function saveAutoCorrections() {
  await chrome.storage.sync.set({ autoCorrections });
}

function addAutoCorrection(typo, correction) {
  autoCorrections[typo.toLowerCase()] = correction;
  saveAutoCorrections();
}

function removeAutoCorrection(typo) {
  delete autoCorrections[typo.toLowerCase()];
  saveAutoCorrections();
}

// Conditional rows
function addConditionalRow(ce = null) {
  const container = document.getElementById('conditionalExpansions');
  const row = document.createElement('div');
  row.className = 'conditional-expansion-row';
  row.innerHTML = `
    <div class="form-group" style="margin-bottom: 8px;">
      <textarea class="cond-expansion-input" placeholder="Expansion for this condition" rows="2">${ce ? escapeHtml(ce.expansion) : ''}</textarea>
    </div>
    <div class="form-row" style="margin-bottom: 8px;">
      <div class="form-group" style="margin-bottom: 0;"><input type="number" class="cond-time-start" placeholder="Start" min="0" max="23" value="${ce?.timeRange?.start ?? ''}"></div>
      <div class="form-group" style="margin-bottom: 0;"><input type="number" class="cond-time-end" placeholder="End" min="0" max="23" value="${ce?.timeRange?.end ?? ''}"></div>
      <div class="form-group" style="margin-bottom: 0;">
        <select class="cond-day-select">
          <option value="">Any</option>
          ${[0,1,2,3,4,5,6].map(d => `<option value="${d}" ${ce?.day === d ? 'selected' : ''}>${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <label style="font-size:12px;"><input type="checkbox" class="cond-weekday" ${ce?.weekdayOnly ? 'checked' : ''}> Weekdays</label>
      <button type="button" class="btn btn-danger btn-sm remove-cond">Remove</button>
    </div>
  `;
  container.appendChild(row);
  row.querySelector('.remove-cond').addEventListener('click', () => row.remove());
}

// Test sandbox
function testExpansion() {
  const expansion = document.getElementById('expansionInput').value;
  const output = document.getElementById('testOutput');
  
  try {
    let result = processVariablesPreview(expansion);
    output.textContent = result;
  } catch (e) {
    output.textContent = 'Error: ' + e.message;
  }
}

function processVariablesPreview(text) {
  const now = new Date();
  
  // Date formatting
  text = text.replace(/\{date:([^}]+)\}/g, (_, fmt) => formatDate(now, fmt));
  text = text.replace(/\{date\}/g, now.toLocaleDateString());
  text = text.replace(/\{time\}/g, now.toLocaleTimeString());
  text = text.replace(/\{datetime\}/g, now.toLocaleString());
  text = text.replace(/\{year\}/g, now.getFullYear());
  text = text.replace(/\{month\}/g, String(now.getMonth() + 1).padStart(2, '0'));
  text = text.replace(/\{day\}/g, String(now.getDate()).padStart(2, '0'));
  
  // Counter
  text = text.replace(/\{counter:([^}]+)\}/g, (_, name) => {
    const c = (counters[name] || 0) + 1;
    return String(c).padStart(4, '0');
  });
  
  // Random
  text = text.replace(/\{random:([^}]+)\}/g, (_, opts) => {
    const options = opts.split('|');
    return options[Math.floor(Math.random() * options.length)];
  });
  
  // JS snippets (sandboxed preview)
  text = text.replace(/\{js:([^}]+)\}/g, (_, code) => {
    try {
      return String(eval(code));
    } catch (e) {
      return `[JS Error: ${e.message}]`;
    }
  });
  
  // Nested macros
  text = text.replace(/\{macro:([^}]+)\}/g, (_, shortcut) => {
    const m = macros.find(mac => mac.shortcut === shortcut);
    return m ? `[→ ${m.expansion.substring(0, 30)}...]` : `[macro not found: ${shortcut}]`;
  });
  
  // Special
  text = text.replace(/\{cursor\}/g, '|');
  text = text.replace(/\{clipboard\}/g, '[clipboard]');
  text = text.replace(/\{input:([^}]+)\}/g, (_, label) => `[${label}]`);
  text = text.replace(/\{newline\}/g, '\n');
  text = text.replace(/\{tab\}/g, '\t');
  
  return text;
}

function formatDate(date, format) {
  const map = {
    'YYYY': date.getFullYear(),
    'YY': String(date.getFullYear()).slice(-2),
    'MM': String(date.getMonth() + 1).padStart(2, '0'),
    'DD': String(date.getDate()).padStart(2, '0'),
    'HH': String(date.getHours()).padStart(2, '0'),
    'mm': String(date.getMinutes()).padStart(2, '0'),
    'ss': String(date.getSeconds()).padStart(2, '0')
  };
  
  let result = format;
  Object.entries(map).forEach(([k, v]) => {
    result = result.replace(new RegExp(k, 'g'), v);
  });
  return result;
}

// Folder modal
function openAddFolder() {
  document.getElementById('folderNameInput').value = '';
  document.querySelectorAll('.color-option').forEach((o, i) => o.classList.toggle('selected', i === 0));
  showModal('folderModal');
  document.getElementById('folderNameInput').focus();
}

async function saveFolder() {
  const name = document.getElementById('folderNameInput').value.trim();
  const color = document.querySelector('.color-option.selected')?.dataset.color || '#c44eff';
  
  if (!name) {
    showToast('Please enter a name', 'error');
    return;
  }
  
  if (folders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
    showToast('Folder already exists', 'error');
    return;
  }
  
  folders.push({ id: Date.now().toString(), name, color });
  await saveFolders();
  closeModal('folderModal');
  showToast('Folder created! 📁', 'success');
}

// Templates
function openTemplates() {
  const grid = document.getElementById('templatesGrid');
  grid.innerHTML = TEMPLATES.map((t, i) => `
    <div class="template-card" data-index="${i}">
      <div class="template-card-icon">${t.icon}</div>
      <div class="template-card-title">${t.title}</div>
      <div class="template-card-desc">${t.desc}</div>
    </div>
  `).join('');
  
  grid.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => addTemplate(parseInt(card.dataset.index)));
  });
  
  showModal('templatesModal');
}

async function addTemplate(index) {
  const t = TEMPLATES[index];
  if (!t) return;
  
  if (macros.some(m => m.shortcut.toLowerCase() === t.shortcut.toLowerCase())) {
    showToast('Shortcut already exists', 'error');
    return;
  }
  
  let expansion = t.expansion;
  
  // If it's a signature template, try to use saved signature data
  if (t.category === 'signature') {
    try {
      const result = await chrome.storage.sync.get(['signatureSettings']);
      const sigSettings = result.signatureSettings || {};
      if (sigSettings.name || sigSettings.email) {
        // Replace placeholders with actual data
        expansion = expansion
          .replace(/{input:Your Name}/g, sigSettings.name || '{input:Your Name}')
          .replace(/{input:Name}/g, sigSettings.name || '{input:Name}')
          .replace(/{input:Title}/g, sigSettings.title || '{input:Title}')
          .replace(/{input:Company}/g, sigSettings.company || '{input:Company}')
          .replace(/{input:Email}/g, sigSettings.email || '{input:Email}')
          .replace(/{input:Phone}/g, sigSettings.phone || '{input:Phone}')
          .replace(/{input:Website}/g, sigSettings.website || '{input:Website}');
      }
    } catch (e) {
      console.error('Error loading signature settings:', e);
    }
  }
  
  macros.push({
    id: Date.now().toString(),
    shortcut: t.shortcut,
    expansion: expansion,
    isRegex: t.isRegex || false,
    conditions: t.conditions,
    tags: t.category ? [t.category] : [],
    enabled: true
  });
  
  await chrome.storage.sync.set({ macros });
  renderMacros();
  closeModal('templatesModal');
  showToast(`Added "${t.title}" 🎉`, 'success');
}

// Packages
function openPackages() {
  const grid = document.getElementById('packagesGrid');
  grid.innerHTML = PACKAGES.map((p, i) => `
    <div class="package-card" data-index="${i}">
      <div class="package-icon">${p.icon}</div>
      <div class="package-info">
        <div class="package-name">${p.name}</div>
        <div class="package-desc">${p.desc}</div>
        <div class="package-stats">
          <span>📝 ${p.count} macros</span>
          <span>👤 ${p.author}</span>
        </div>
      </div>
    </div>
  `).join('');
  
  grid.querySelectorAll('.package-card').forEach(card => {
    card.addEventListener('click', () => {
      showToast('Package download coming soon! 📦', 'info');
    });
  });
  
  showModal('packagesModal');
}

// Dashboard
function openDashboard() {
  updateDashboard();
  generateHeatmap();
  showModal('dashboardModal');
}

function updateDashboard() {
  let totalExpansions = 0;
  let totalChars = 0;
  const dayUsage = {};
  
  Object.entries(macroStats).forEach(([id, stat]) => {
    totalExpansions += stat.count || 0;
    if (stat.lastUsed) {
      const day = new Date(stat.lastUsed).toLocaleDateString('en-US', { weekday: 'short' });
      dayUsage[day] = (dayUsage[day] || 0) + stat.count;
    }
  });
  
  macros.forEach(m => {
    const stat = macroStats[m.id] || { count: 0 };
    totalChars += Math.max(0, (m.expansion.length - m.shortcut.length) * stat.count);
  });
  
  document.getElementById('dashTotalMacros').textContent = macros.length;
  document.getElementById('dashTotalExpansions').textContent = totalExpansions.toLocaleString();
  document.getElementById('dashCharsSaved').textContent = totalChars.toLocaleString();
  document.getElementById('dashTimeSaved').textContent = `~${Math.round(totalChars / 200)} min saved`;
  
  const mostActive = Object.entries(dayUsage).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('dashMostActiveDay').textContent = mostActive ? mostActive[0] : '-';
  
  // Top macros chart
  const chart = document.getElementById('topMacrosChart');
  const topMacros = macros
    .map(m => ({ ...m, count: macroStats[m.id]?.count || 0 }))
    .filter(m => m.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  const max = topMacros[0]?.count || 1;
  
  if (topMacros.length === 0) {
    chart.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px;">No usage data yet</div>';
  } else {
    chart.innerHTML = topMacros.map(m => `
      <div class="bar-item">
        <span class="bar-label">${escapeHtml(m.shortcut)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(m.count/max)*100}%"></div></div>
        <span class="bar-value">${m.count}</span>
      </div>
    `).join('');
  }
  
  // Render usage insights
  renderUsageInsights();
}

function renderUsageInsights() {
  const container = document.getElementById('usageInsights');
  if (!container) return;
  
  // Find never-used macros
  const neverUsed = macros.filter(m => !macroStats[m.id] || macroStats[m.id].count === 0);
  
  // Find macros not used in 30+ days
  const stale = macros.filter(m => {
    const stat = macroStats[m.id];
    if (!stat?.lastUsed) return false;
    const daysSince = (Date.now() - stat.lastUsed) / (1000 * 60 * 60 * 24);
    return daysSince > 30 && stat.count > 0;
  });
  
  // Find similar shortcuts that might be confusing
  const similar = findSimilarShortcuts();
  
  let html = '';
  
  if (neverUsed.length > 0) {
    html += `
      <div class="insights-card">
        <div class="insights-card-title">⚠️ Never Used (${neverUsed.length})</div>
        <div class="insights-list">
          ${neverUsed.slice(0, 5).map(m => `
            <div class="insights-item">
              <span class="insights-item-shortcut">${escapeHtml(m.shortcut)}</span>
              <span class="insights-item-action" data-action="delete" data-id="${m.id}">🗑️ Delete</span>
            </div>
          `).join('')}
          ${neverUsed.length > 5 ? `<div style="text-align:center;font-size:11px;color:var(--text-muted);">+${neverUsed.length - 5} more</div>` : ''}
        </div>
      </div>
    `;
  }
  
  if (stale.length > 0) {
    html += `
      <div class="insights-card">
        <div class="insights-card-title">💤 Not Used in 30+ Days (${stale.length})</div>
        <div class="insights-list">
          ${stale.slice(0, 5).map(m => `
            <div class="insights-item">
              <span class="insights-item-shortcut">${escapeHtml(m.shortcut)}</span>
              <span class="insights-item-action" data-action="delete" data-id="${m.id}">🗑️ Delete</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  if (similar.length > 0) {
    html += `
      <div class="insights-card">
        <div class="insights-card-title">🔀 Similar Shortcuts (may cause confusion)</div>
        <div class="insights-list">
          ${similar.slice(0, 5).map(pair => `
            <div class="insights-item">
              <span>
                <span class="insights-item-shortcut">${escapeHtml(pair[0])}</span>
                <span style="color:var(--text-muted);margin:0 4px;">≈</span>
                <span class="insights-item-shortcut">${escapeHtml(pair[1])}</span>
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  if (!html) {
    html = '<div style="text-align:center;color:var(--text-muted);padding:20px;">✨ All macros are being used effectively!</div>';
  }
  
  container.innerHTML = html;
  
  // Add event listeners for delete actions
  container.querySelectorAll('[data-action="delete"]').forEach(el => {
    el.addEventListener('click', async () => {
      const id = el.dataset.id;
      const macro = macros.find(m => m.id === id);
      if (macro && confirm(`Delete "${macro.shortcut}"?`)) {
        // Move to trash
        trash.push({ ...macro, deletedAt: Date.now() });
        await chrome.storage.local.set({ trash });
        macros = macros.filter(m => m.id !== id);
        await saveMacros();
        renderUsageInsights();
        showToast('Moved to trash', 'success');
      }
    });
  });
}

function findSimilarShortcuts() {
  const pairs = [];
  
  for (let i = 0; i < macros.length; i++) {
    for (let j = i + 1; j < macros.length; j++) {
      const a = macros[i].shortcut.toLowerCase();
      const b = macros[j].shortcut.toLowerCase();
      
      // Check if very similar (edit distance <= 2)
      if (levenshteinDistance(a, b) <= 2 && a !== b) {
        pairs.push([macros[i].shortcut, macros[j].shortcut]);
      }
      // Or one is prefix of another
      else if ((a.startsWith(b) || b.startsWith(a)) && a !== b && Math.abs(a.length - b.length) <= 2) {
        pairs.push([macros[i].shortcut, macros[j].shortcut]);
      }
    }
  }
  
  return pairs;
}

function generateHeatmap() {
  const grid = document.getElementById('heatmapGrid');
  if (!grid) return;
  
  // Clear existing cells (keep labels)
  const labels = grid.querySelectorAll('.heatmap-day-label');
  grid.innerHTML = '';
  labels.forEach(l => grid.appendChild(l.cloneNode(true)));
  
  // Generate 28 days (4 weeks)
  const today = new Date();
  const usageByDate = {};
  
  Object.values(macroStats).forEach(stat => {
    if (stat.lastUsed) {
      const date = new Date(stat.lastUsed).toDateString();
      usageByDate[date] = (usageByDate[date] || 0) + stat.count;
    }
  });
  
  const maxUsage = Math.max(...Object.values(usageByDate), 1);
  
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const usage = usageByDate[date.toDateString()] || 0;
    const level = Math.min(5, Math.ceil((usage / maxUsage) * 5));
    
    const cell = document.createElement('div');
    cell.className = `heatmap-cell level-${level}`;
    cell.title = `${date.toLocaleDateString()}: ${usage} expansions`;
    grid.appendChild(cell);
  }
}

async function resetStats() {
  if (confirm('Reset all statistics?')) {
    macroStats = {};
    await chrome.storage.sync.set({ macroStats });
    updateDashboard();
    updateQuickStats();
    renderRecentMacros();
    generateHeatmap();
    showToast('Statistics reset', 'success');
  }
}

// Helpers
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escaped.replace(regex, '<span class="highlight">$1</span>');
}

function fuzzySearch(query, text) {
  if (!query) return true;
  query = query.toLowerCase();
  text = text.toLowerCase();
  let qi = 0;
  for (let i = 0; i < text.length && qi < query.length; i++) {
    if (text[i] === query[qi]) qi++;
  }
  return qi === query.length;
}

function sortMacros(list) {
  return [...list].sort((a, b) => {
    const sa = macroStats[a.id] || {};
    const sb = macroStats[b.id] || {};
    switch (sortBy) {
      case 'usage': return (sb.count || 0) - (sa.count || 0);
      case 'recent': return (sb.lastUsed || 0) - (sa.lastUsed || 0);
      case 'created': return (b.id || '').localeCompare(a.id || '');
      default: return a.shortcut.localeCompare(b.shortcut);
    }
  });
}

function showModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${escapeHtml(message)}</span>`;
  document.body.appendChild(toast);
  
  // Add flash animation
  setTimeout(() => toast.classList.add('toast-in'), 10);
  
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Event listeners
function setupEventListeners() {
  // Theme
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  
  // More dropdown
  const moreBtn = document.getElementById('moreBtn');
  const moreDropdown = document.getElementById('moreDropdown');
  if (moreBtn && moreDropdown) {
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moreDropdown.style.display = moreDropdown.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => {
      moreDropdown.style.display = 'none';
    });
    moreDropdown.addEventListener('click', () => {
      moreDropdown.style.display = 'none';
    });
  }
  
  // Main buttons
  document.getElementById('addMacroBtn')?.addEventListener('click', openAddMacro);
  document.getElementById('emptyAddBtn')?.addEventListener('click', openAddMacro);
  document.getElementById('emptyTemplateBtn')?.addEventListener('click', () => { closeModal('macroModal'); openTemplates(); });
  document.getElementById('emptySampleBtn')?.addEventListener('click', addSampleMacros);
  document.getElementById('clearRecentBtn')?.addEventListener('click', clearRecentStats);
  document.getElementById('addFolderBtn')?.addEventListener('click', openAddFolder);
  document.getElementById('helpBtn')?.addEventListener('click', () => showModal('helpModal'));
  document.getElementById('settingsBtn')?.addEventListener('click', () => chrome.runtime.openOptionsPage());
  document.getElementById('templatesBtn')?.addEventListener('click', openTemplates);
  document.getElementById('packagesBtn')?.addEventListener('click', openPackages);
  document.getElementById('dashboardBtn')?.addEventListener('click', openDashboard);
  document.getElementById('trashBtn')?.addEventListener('click', openTrash);
  document.getElementById('importBtn')?.addEventListener('click', openImport);
  
  // Trash modal
  document.getElementById('closeTrashModal')?.addEventListener('click', () => closeModal('trashModal'));
  document.getElementById('closeTrashBtn')?.addEventListener('click', () => closeModal('trashModal'));
  document.getElementById('emptyTrashBtn')?.addEventListener('click', emptyTrash);
  
  // Import modal
  document.getElementById('closeImportModal')?.addEventListener('click', () => closeModal('importModal'));
  document.getElementById('closeImportBtn')?.addEventListener('click', () => closeModal('importModal'));
  document.getElementById('importFountainBtn')?.addEventListener('click', () => triggerImport('fountain'));
  document.getElementById('importTextExpanderBtn')?.addEventListener('click', () => triggerImport('textexpander'));
  document.getElementById('importATextBtn')?.addEventListener('click', () => triggerImport('atext'));
  document.getElementById('importFileInput')?.addEventListener('change', handleImportFile);
  
  // Search & filters
  document.getElementById('searchInput')?.addEventListener('input', e => renderMacros(e.target.value));
  document.getElementById('folderFilter')?.addEventListener('change', e => {
    selectedFolderId = e.target.value;
    renderMacros(document.getElementById('searchInput')?.value || '');
  });
  document.getElementById('sortSelect')?.addEventListener('change', e => {
    sortBy = e.target.value;
    renderMacros(document.getElementById('searchInput')?.value || '');
  });
  
  // Bulk actions
  document.getElementById('bulkDeleteBtn')?.addEventListener('click', bulkDelete);
  document.getElementById('bulkExportBtn')?.addEventListener('click', bulkExport);
  document.getElementById('bulkFavoriteBtn')?.addEventListener('click', bulkFavorite);
  document.getElementById('bulkPinBtn')?.addEventListener('click', bulkPin);
  document.getElementById('bulkMoveBtn')?.addEventListener('click', () => showModal('bulkMoveModal'));
  document.getElementById('bulkCancelBtn')?.addEventListener('click', clearSelection);
  document.getElementById('confirmBulkMoveBtn')?.addEventListener('click', () => bulkMove(document.getElementById('bulkFolderSelect')?.value));
  document.getElementById('cancelBulkMoveBtn')?.addEventListener('click', () => closeModal('bulkMoveModal'));
  document.getElementById('closeBulkMoveModal')?.addEventListener('click', () => closeModal('bulkMoveModal'));
  
  // Macro modal
  document.getElementById('closeModal')?.addEventListener('click', () => closeModal('macroModal'));
  document.getElementById('cancelBtn')?.addEventListener('click', () => closeModal('macroModal'));
  document.getElementById('saveMacroBtn')?.addEventListener('click', saveMacro);
  setupConflictChecker();
  document.getElementById('deleteMacroBtn')?.addEventListener('click', deleteMacro);
  document.getElementById('duplicateMacroBtn')?.addEventListener('click', duplicateMacro);
  document.getElementById('testExpansionBtn')?.addEventListener('click', testExpansion);
  
  document.getElementById('addDomainBtn')?.addEventListener('click', addDomain);
  document.getElementById('domainInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addDomain(); }});
  
  document.getElementById('addBlacklistBtn')?.addEventListener('click', addBlacklist);
  document.getElementById('blacklistInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addBlacklist(); }});
  
  document.getElementById('enableConditionsCheck')?.addEventListener('change', e => {
    document.getElementById('conditionsPanel').style.display = e.target.checked ? 'block' : 'none';
  });
  
  document.getElementById('showBlacklistCheck')?.addEventListener('change', e => {
    document.getElementById('blacklistSection').style.display = e.target.checked ? 'block' : 'none';
  });
  
  document.getElementById('addConditionalBtn')?.addEventListener('click', () => addConditionalRow());
  
  // Folder modal
  document.getElementById('closeFolderModal')?.addEventListener('click', () => closeModal('folderModal'));
  document.getElementById('cancelFolderBtn')?.addEventListener('click', () => closeModal('folderModal'));
  document.getElementById('saveFolderBtn')?.addEventListener('click', saveFolder);
  document.getElementById('folderNameInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') saveFolder(); });
  
  document.querySelectorAll('.color-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
  
  // Help modal
  document.getElementById('closeHelpModal')?.addEventListener('click', () => closeModal('helpModal'));
  document.getElementById('closeHelpBtn')?.addEventListener('click', () => closeModal('helpModal'));
  
  document.querySelectorAll('.help-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.help-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.help-section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${btn.dataset.section}`)?.classList.add('active');
    });
  });
  
  // Templates
  document.getElementById('closeTemplatesModal')?.addEventListener('click', () => closeModal('templatesModal'));
  document.getElementById('closeTemplatesBtn')?.addEventListener('click', () => closeModal('templatesModal'));
  
  // Packages
  document.getElementById('closePackagesModal')?.addEventListener('click', () => closeModal('packagesModal'));
  document.getElementById('closePackagesBtn')?.addEventListener('click', () => closeModal('packagesModal'));
  document.getElementById('createPackageBtn')?.addEventListener('click', () => {
    downloadJSON(macros, 'fountain-package');
    showToast('Package created! 📦', 'success');
  });
  
  // Dashboard
  document.getElementById('closeDashboardModal')?.addEventListener('click', () => closeModal('dashboardModal'));
  document.getElementById('closeDashboardBtn')?.addEventListener('click', () => closeModal('dashboardModal'));
  document.getElementById('resetStatsBtn')?.addEventListener('click', resetStats);
  
  // Onboarding
  document.getElementById('onboardingNext')?.addEventListener('click', nextOnboardingStep);
  document.getElementById('onboardingSkip')?.addEventListener('click', closeOnboarding);
  
  // Keyboard navigation
  setupKeyboardNavigation();
  
  // Close modals on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal.id);
    });
  });
  
  // Quick create
  document.getElementById('quickCreateBtn')?.addEventListener('click', openQuickCreate);
  document.getElementById('closeQuickCreateModal')?.addEventListener('click', () => closeModal('quickCreateModal'));
  document.getElementById('cancelQuickCreateBtn')?.addEventListener('click', () => closeModal('quickCreateModal'));
  document.getElementById('saveQuickCreateBtn')?.addEventListener('click', saveQuickCreate);
  
  // View toggles
  document.getElementById('viewListBtn')?.addEventListener('click', () => setViewMode('list'));
  document.getElementById('viewGridBtn')?.addEventListener('click', () => setViewMode('grid'));
  document.getElementById('viewCompactBtn')?.addEventListener('click', () => setViewMode('compact'));
  
  // Filter buttons
  document.getElementById('filterPinnedBtn')?.addEventListener('click', () => toggleFilter('pinned'));
  document.getElementById('filterFavoritesBtn')?.addEventListener('click', () => toggleFilter('favorites'));
  document.getElementById('filterRecentBtn')?.addEventListener('click', () => toggleFilter('recent'));
  document.getElementById('filterTagsBtn')?.addEventListener('click', () => showTagFilter());
  document.getElementById('clearFiltersBtn')?.addEventListener('click', clearAllFilters);
  
  // Keyboard shortcuts - comprehensive
  setupKeyboardNavigation();
}

// Keyboard Navigation System
let currentSelectedIndex = -1;
let currentViewMode = 'list';
let activeFilters = new Set();
let searchDebounceTimer = null;

function setupKeyboardNavigation() {
  // Focus search on '/' key
  document.addEventListener('keydown', e => {
    // Don't interfere if typing in input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      // Allow special shortcuts even in inputs
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const modal = document.querySelector('.modal.active');
        if (modal?.id === 'macroModal') {
          saveMacro();
        } else if (modal?.id === 'quickCreateModal') {
          saveQuickCreate();
        }
        return;
      }
      return;
    }
    
    // Global shortcuts
    if (e.key === '/') {
      e.preventDefault();
      document.getElementById('searchInput')?.focus();
      return;
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
      e.preventDefault();
      openAddMacro();
      return;
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('searchInput')?.focus();
      return;
    }
    
    if (e.key === 'Escape') {
      // Close context menu first
      const contextMenu = document.getElementById('contextMenu');
      if (contextMenu && contextMenu.style.display !== 'none') {
        hideContextMenu();
        return;
      }
      // Then close modals
      document.querySelectorAll('.modal.active').forEach(m => closeModal(m.id));
      return;
    }
    
    // Navigation in macro list
    const macros = Array.from(document.querySelectorAll('.macro-item[data-macro-id]'));
    if (macros.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentSelectedIndex = Math.min(currentSelectedIndex + 1, macros.length - 1);
      highlightMacro(macros[currentSelectedIndex]);
      macros[currentSelectedIndex]?.scrollIntoView({ block: 'nearest' });
      return;
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentSelectedIndex = Math.max(currentSelectedIndex - 1, -1);
      if (currentSelectedIndex >= 0) {
        highlightMacro(macros[currentSelectedIndex]);
        macros[currentSelectedIndex]?.scrollIntoView({ block: 'nearest' });
      } else {
        clearMacroHighlight();
      }
      return;
    }
    
    if (e.key === 'Enter' && currentSelectedIndex >= 0 && macros[currentSelectedIndex]) {
      e.preventDefault();
      const macroId = macros[currentSelectedIndex].dataset.macroId;
      editMacro(macroId);
      return;
    }
    
    if ((e.key === 'Delete' || e.key === 'Backspace') && currentSelectedIndex >= 0 && macros[currentSelectedIndex]) {
      e.preventDefault();
      const macroId = macros[currentSelectedIndex].dataset.macroId;
      if (confirm('Delete this macro?')) {
        deleteMacroById(macroId);
      }
      return;
    }
  });
  
  // Search input enhancements
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    // Debounced search
    searchInput.addEventListener('input', e => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        renderMacros(e.target.value);
        currentSelectedIndex = -1;
      }, 150);
    });
    
    // Search shortcuts
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.value.startsWith(':')) {
        handleSearchShortcut(e.target.value);
        return;
      }
    });
    
    // Auto-focus on popup open
    setTimeout(() => searchInput.focus(), 100);
  }
}

function highlightMacro(element) {
  document.querySelectorAll('.macro-item').forEach(el => el.classList.remove('keyboard-selected'));
  element?.classList.add('keyboard-selected');
}

function clearMacroHighlight() {
  document.querySelectorAll('.macro-item').forEach(el => el.classList.remove('keyboard-selected'));
  currentSelectedIndex = -1;
}

// Quick Create
async function openQuickCreate() {
  const modal = document.getElementById('quickCreateModal');
  showModal('quickCreateModal');
  
  // Try to get clipboard content
  try {
    const clip = await navigator.clipboard.readText();
    if (clip) {
      document.getElementById('quickExpansionInput').value = clip;
    }
  } catch (e) {}
}

async function saveQuickCreate() {
  const shortcut = document.getElementById('quickShortcutInput').value.trim();
  const expansion = document.getElementById('quickExpansionInput').value.trim();
  
  if (!shortcut || !expansion) {
    showToast('Please fill in both fields', 'error');
    return;
  }
  
  // Check for duplicates
  if (macros.some(m => m.shortcut.toLowerCase() === shortcut.toLowerCase())) {
    if (!confirm('Shortcut already exists. Overwrite?')) return;
    macros = macros.filter(m => m.shortcut.toLowerCase() !== shortcut.toLowerCase());
  }
  
  macros.push({
    id: Date.now().toString(),
    shortcut,
    expansion,
    enabled: true,
    createdAt: new Date().toISOString()
  });
  
  await saveMacros();
  closeModal('quickCreateModal');
  document.getElementById('quickShortcutInput').value = '';
  document.getElementById('quickExpansionInput').value = '';
  showToast('Macro created! ✨', 'success');
  renderMacros();
}

// View Modes
function setViewMode(mode) {
  currentViewMode = mode;
  const list = document.getElementById('macrosList');
  list.className = `macros-list view-${mode}`;
  
  document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`view${mode.charAt(0).toUpperCase() + mode.slice(1)}Btn`)?.classList.add('active');
  
  renderMacros(document.getElementById('searchInput')?.value || '');
  localStorage.setItem('fountain-view-mode', mode);
}

// Filters
function toggleFilter(filterType) {
  if (activeFilters.has(filterType)) {
    activeFilters.delete(filterType);
  } else {
    activeFilters.add(filterType);
  }
  updateActiveFilters();
  renderMacros(document.getElementById('searchInput')?.value || '');
}

function clearAllFilters() {
  activeFilters.clear();
  updateActiveFilters();
  renderMacros(document.getElementById('searchInput')?.value || '');
}

function updateActiveFilters() {
  const container = document.getElementById('activeFilters');
  const list = document.getElementById('activeFiltersList');
  
  if (activeFilters.size === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'flex';
  list.innerHTML = Array.from(activeFilters).map(f => 
    `<span class="active-filter-tag">${f}<button class="remove-filter" data-filter="${f}">×</button></span>`
  ).join('');
  
  list.querySelectorAll('.remove-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilters.delete(btn.dataset.filter);
      updateActiveFilters();
      renderMacros(document.getElementById('searchInput')?.value || '');
    });
  });
}

function showTagFilter() {
  const tags = [...new Set(macros.flatMap(m => m.tags || []))];
  if (tags.length === 0) {
    showToast('No tags available', 'error');
    return;
  }
  
  const tag = prompt(`Filter by tag:\n${tags.join(', ')}`);
  if (tag && tags.includes(tag)) {
    activeFilters.add(`tag:${tag}`);
    updateActiveFilters();
    renderMacros(document.getElementById('searchInput')?.value || '');
  }
}

function handleSearchShortcut(query) {
  // Handle :sig, :fav, :pin, etc.
  const shortcuts = {
    ':sig': () => { activeFilters.add('tag:signature'); updateActiveFilters(); renderMacros(''); },
    ':fav': () => { activeFilters.add('favorites'); updateActiveFilters(); renderMacros(''); },
    ':pin': () => { activeFilters.add('pinned'); updateActiveFilters(); renderMacros(''); },
    ':pinned': () => { activeFilters.add('pinned'); updateActiveFilters(); renderMacros(''); },
    ':recent': () => { activeFilters.add('recent'); updateActiveFilters(); renderMacros(''); }
  };
  
  if (shortcuts[query.toLowerCase()]) {
    shortcuts[query.toLowerCase()]();
    document.getElementById('searchInput').value = '';
  }
}

async function clearRecentStats() {
  if (confirm('Clear recent usage stats? This will reset when macros were last used.')) {
    Object.keys(macroStats).forEach(id => {
      if (macroStats[id]) delete macroStats[id].lastUsed;
    });
    await chrome.storage.sync.set({ macroStats });
    renderRecentMacros();
    showToast('Recent stats cleared', 'success');
  }
}

// Search Suggestions
function updateSearchSuggestions(query) {
  const suggestions = document.getElementById('searchSuggestions');
  if (!query || query.length < 2) {
    suggestions.style.display = 'none';
    return;
  }
  
  // Get matching macros for suggestions
  const matches = macros
    .filter(m => 
      m.shortcut.toLowerCase().includes(query.toLowerCase()) ||
      (m.tags || []).some(t => t.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 5);
  
  if (matches.length === 0) {
    suggestions.style.display = 'none';
    return;
  }
  
  suggestions.innerHTML = matches.map(m => `
    <div class="search-suggestion-item" data-shortcut="${escapeHtml(m.shortcut)}">
      <span class="suggestion-shortcut">${escapeHtml(m.shortcut)}</span>
      <span class="suggestion-preview">${escapeHtml(m.expansion.substring(0, 40))}...</span>
    </div>
  `).join('');
  
  suggestions.style.display = 'block';
  
  // Click handlers
  suggestions.querySelectorAll('.search-suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      const shortcut = item.dataset.shortcut;
      document.getElementById('searchInput').value = shortcut;
      suggestions.style.display = 'none';
      renderMacros(shortcut);
    });
  });
}

// Hover Preview
let hoverPreviewElement = null;

function showHoverPreview(element, macroId) {
  const macro = macros.find(m => m.id === macroId);
  if (!macro) return;
  
  hideHoverPreview();
  
  hoverPreviewElement = document.createElement('div');
  hoverPreviewElement.className = 'hover-preview';
  hoverPreviewElement.innerHTML = `
    <div class="hover-preview-header">
      <strong>${escapeHtml(macro.shortcut)}</strong>
      ${macro.favorited ? '<span>⭐</span>' : ''}
    </div>
    <div class="hover-preview-content">
      <pre>${escapeHtml(macro.expansion)}</pre>
    </div>
  `;
  
  document.body.appendChild(hoverPreviewElement);
  
  const rect = element.getBoundingClientRect();
  hoverPreviewElement.style.top = `${rect.bottom + 5}px`;
  hoverPreviewElement.style.left = `${rect.left}px`;
}

function hideHoverPreview() {
  if (hoverPreviewElement) {
    hoverPreviewElement.remove();
    hoverPreviewElement = null;
  }
}

// Setup Drag and Drop
function setupDragAndDrop() {
  // Already handled in setupMacroListeners, but add folder drop zones
  document.querySelectorAll('.folder-header').forEach(header => {
    header.addEventListener('dragover', e => {
      e.preventDefault();
      header.classList.add('drag-over-folder');
    });
    header.addEventListener('dragleave', () => {
      header.classList.remove('drag-over-folder');
    });
    header.addEventListener('drop', async e => {
      e.preventDefault();
      header.classList.remove('drag-over-folder');
      const macroId = e.dataTransfer.getData('text/plain');
      const folderId = header.closest('.folder-section')?.dataset.folderId;
      if (macroId && folderId) {
        const macro = macros.find(m => m.id === macroId);
        if (macro) {
          macro.folderId = folderId;
          await saveMacros();
        }
      }
    });
  });
}

// Conflict Detection
function checkConflicts(shortcut, excludeId = null) {
  const lower = shortcut.toLowerCase();
  
  // Exact match
  const exact = macros.filter(m => 
    m.id !== excludeId && 
    (m.shortcut.toLowerCase() === lower ||
     (m.aliases || []).some(a => a.toLowerCase() === lower))
  );
  
  if (exact.length > 0) {
    showToast(`Warning: Shortcut "${shortcut}" already exists!`, 'warning');
    return { exact, similar: [] };
  }
  
  // Similar shortcuts (for warning)
  const similar = macros.filter(m => {
    if (m.id === excludeId) return false;
    const mShortcut = m.shortcut.toLowerCase();
    // Check for prefix conflicts (one starts with the other)
    if (mShortcut.startsWith(lower) || lower.startsWith(mShortcut)) return true;
    // Check Levenshtein distance for similar typos
    if (levenshteinDistance(lower, mShortcut) <= 2 && lower.length > 2) return true;
    return false;
  });
  
  if (similar.length > 0) {
    const names = similar.slice(0, 3).map(m => m.shortcut).join(', ');
    showToast(`Similar shortcuts exist: ${names}`, 'info');
  }
  
  return { exact, similar };
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Real-time conflict checking on input
function setupConflictChecker() {
  const shortcutInput = document.getElementById('shortcutInput');
  if (!shortcutInput) return;
  
  let debounceTimer;
  shortcutInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const value = shortcutInput.value.trim();
      if (value.length >= 2) {
        checkConflicts(value, currentEditingId);
      }
    }, 500);
  });
}

// Load view mode preference
function loadViewMode() {
  const saved = localStorage.getItem('fountain-view-mode');
  if (saved && ['list', 'grid', 'compact'].includes(saved)) {
    setViewMode(saved);
  }
}



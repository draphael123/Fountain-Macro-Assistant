// Fountain - Macro Assistant v3.0 - Feature-rich popup
// With: favorites, regex, JS snippets, packages, heatmap, onboarding, and more

let macros = [];
let folders = [];
let macroStats = {};
let counters = {};
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

// Templates
const TEMPLATES = [
  { icon: '📧', title: 'Email Signature', desc: 'Professional sign-off', shortcut: '/sig', expansion: 'Best regards,\n{input:Your Name}\n{input:Title} | {input:Company}' },
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
  setupEventListeners();
  checkFirstRun();
  checkPendingMacro();
  // Update sync button state on load
  updateSyncButtonState();
});

// Update sync button state without opening modal
async function updateSyncButtonState() {
  try {
    const isLoggedIn = await CloudSync.isLoggedIn();
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
      if (isLoggedIn) {
        syncBtn.classList.add('synced');
        syncBtn.textContent = '✓ Synced';
      } else {
        syncBtn.classList.remove('synced');
        syncBtn.textContent = '☁️ Sync';
      }
    }
  } catch (e) {
    console.error('Error updating sync button state:', e);
  }
}

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
    const result = await chrome.storage.sync.get(['macros', 'folders', 'macroStats', 'counters', 'lightMode', 'hasOnboarded']);
    macros = result.macros || [];
    folders = result.folders || [];
    macroStats = result.macroStats || {};
    counters = result.counters || {};
    lightMode = result.lightMode || false;
    isFirstRun = !result.hasOnboarded;
    
    applyTheme();
    updateFolderSelects();
    updateQuickStats();
    renderFavorites();
    renderRecentMacros();
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
  renderFavorites();
  renderRecentMacros();
  renderMacros();
  // Trigger cloud sync if enabled
  triggerAutoSync();
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
      <div class="recent-macro-chip" data-id="${m.id}">
        <span class="shortcut">${escapeHtml(m.shortcut)}</span>
        <span class="usage">${stat.count}</span>
      </div>
    `;
  }).join('');
  
  container.querySelectorAll('.recent-macro-chip').forEach(el => {
    el.addEventListener('click', () => editMacro(el.dataset.id));
  });
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
    
    return matchesSearch && matchesFolder;
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
  
  let html = '';
  
  // Render folders
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
  
  list.innerHTML = html;
  setupMacroListeners();
}

// Render single macro item
function renderMacroItem(macro, filter = '') {
  const stats = macroStats[macro.id] || { count: 0 };
  const isSelected = selectedMacros.has(macro.id);
  const isEnabled = macro.enabled !== false;
  const isFavorite = macro.favorited;
  
  const shortcutDisplay = filter ? highlight(macro.shortcut, filter) : escapeHtml(macro.shortcut);
  const preview = macro.expansion.substring(0, 80) + (macro.expansion.length > 80 ? '...' : '');
  
  const indicators = [];
  if (macro.aliases?.length) indicators.push('<span class="indicator alias" title="Has aliases">🔗</span>');
  if (macro.conditions && Object.keys(macro.conditions).length) indicators.push('<span class="indicator condition" title="Conditional">⚡</span>');
  if (macro.domains?.length) indicators.push('<span class="indicator domain" title="Domain filter">🌐</span>');
  if (macro.isRegex) indicators.push('<span class="indicator regex" title="Regex pattern">🎯</span>');
  if (macro.expansion.includes('{js:')) indicators.push('<span class="indicator js" title="JavaScript">💻</span>');
  
  return `
    <div class="macro-item ${isSelected ? 'selected' : ''} ${!isEnabled ? 'disabled' : ''} ${isFavorite ? 'favorited' : ''}" 
         data-id="${macro.id}" draggable="true">
      <div class="macro-header">
        <div class="macro-header-left">
          <input type="checkbox" class="macro-checkbox" ${isSelected ? 'checked' : ''} data-id="${macro.id}">
          <span class="drag-handle">⠿</span>
          <div class="macro-shortcut">
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
  document.querySelectorAll('.macro-item').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.classList.contains('macro-checkbox') || 
          e.target.classList.contains('toggle-switch') ||
          e.target.classList.contains('favorite-btn') ||
          e.target.classList.contains('drag-handle')) return;
      editMacro(el.dataset.id);
    });
    
    el.addEventListener('dblclick', e => {
      // Quick inline edit could go here
    });
    
    // Drag & drop
    el.addEventListener('dragstart', handleDragStart);
    el.addEventListener('dragend', handleDragEnd);
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('drop', handleDrop);
    el.addEventListener('dragleave', e => e.currentTarget.classList.remove('drag-over'));
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
  
  // Check duplicates
  const allShortcuts = [shortcut, ...aliases];
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
  if (confirm('Delete this macro?')) {
    macros = macros.filter(m => m.id !== currentEditingId);
    await saveMacros();
    closeModal('macroModal');
    showToast('Macro deleted', 'success');
  }
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
  
  macros.push({
    id: Date.now().toString(),
    shortcut: t.shortcut,
    expansion: t.expansion,
    isRegex: t.isRegex || false,
    conditions: t.conditions,
    enabled: true
  });
  
  await saveMacros();
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
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${escapeHtml(message)}</span>`;
  document.body.appendChild(toast);
  
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
  
  // Main buttons
  document.getElementById('addMacroBtn')?.addEventListener('click', openAddMacro);
  document.getElementById('emptyAddBtn')?.addEventListener('click', openAddMacro);
  document.getElementById('addFolderBtn')?.addEventListener('click', openAddFolder);
  document.getElementById('helpBtn')?.addEventListener('click', () => showModal('helpModal'));
  document.getElementById('templatesBtn')?.addEventListener('click', openTemplates);
  document.getElementById('packagesBtn')?.addEventListener('click', openPackages);
  document.getElementById('dashboardBtn')?.addEventListener('click', openDashboard);
  
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
  document.getElementById('bulkMoveBtn')?.addEventListener('click', () => showModal('bulkMoveModal'));
  document.getElementById('bulkCancelBtn')?.addEventListener('click', clearSelection);
  document.getElementById('confirmBulkMoveBtn')?.addEventListener('click', () => bulkMove(document.getElementById('bulkFolderSelect')?.value));
  document.getElementById('cancelBulkMoveBtn')?.addEventListener('click', () => closeModal('bulkMoveModal'));
  document.getElementById('closeBulkMoveModal')?.addEventListener('click', () => closeModal('bulkMoveModal'));
  
  // Macro modal
  document.getElementById('closeModal')?.addEventListener('click', () => closeModal('macroModal'));
  document.getElementById('cancelBtn')?.addEventListener('click', () => closeModal('macroModal'));
  document.getElementById('saveMacroBtn')?.addEventListener('click', saveMacro);
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
  
  // Cloud Sync
  document.getElementById('syncBtn')?.addEventListener('click', openSyncModal);
  document.getElementById('closeSyncModal')?.addEventListener('click', () => closeModal('syncModal'));
  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  document.getElementById('registerBtn')?.addEventListener('click', handleRegister);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  document.getElementById('syncNowBtn')?.addEventListener('click', handleSyncNow);
  document.getElementById('downloadFromCloudBtn')?.addEventListener('click', handleDownloadFromCloud);
  
  // Sync tab switching
  document.querySelectorAll('.sync-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sync-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.dataset.tab === 'login';
      document.getElementById('loginForm').style.display = isLogin ? 'flex' : 'none';
      document.getElementById('registerForm').style.display = isLogin ? 'none' : 'flex';
    });
  });
  
  // Onboarding
  document.getElementById('onboardingNext')?.addEventListener('click', nextOnboardingStep);
  document.getElementById('onboardingSkip')?.addEventListener('click', closeOnboarding);
  
  // Close modals on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal.id);
    });
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
      e.preventDefault();
      openAddMacro();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('searchInput')?.focus();
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(m => closeModal(m.id));
    }
  });
}

// ==================== CLOUD SYNC ====================

async function openSyncModal() {
  showModal('syncModal');
  await updateSyncUI();
}

async function updateSyncUI() {
  const isLoggedIn = await CloudSync.isLoggedIn();
  
  document.getElementById('syncAuthForm').style.display = isLoggedIn ? 'none' : 'block';
  document.getElementById('syncStatus').style.display = isLoggedIn ? 'block' : 'none';
  
  const syncBtn = document.getElementById('syncBtn');
  if (isLoggedIn) {
    const user = await CloudSync.getUser();
    const lastSync = await CloudSync.getLastSync();
    
    document.getElementById('syncUserName').textContent = user?.displayName || 'User';
    document.getElementById('syncUserEmail').textContent = user?.email || '';
    document.getElementById('lastSyncTime').textContent = lastSync ? 
      new Date(lastSync).toLocaleString() : 'Never';
    document.getElementById('syncedMacroCount').textContent = macros.length;
    
    // Update sync button indicator
    if (syncBtn) {
      syncBtn.classList.add('synced');
      syncBtn.textContent = '✓ Synced';
    }
  } else {
    if (syncBtn) {
      syncBtn.classList.remove('synced');
      syncBtn.textContent = '☁️ Sync';
    }
  }
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showSyncError('Please enter email and password');
    return;
  }
  
  document.getElementById('loginBtn').disabled = true;
  document.getElementById('loginBtn').textContent = 'Signing in...';
  
  const result = await CloudSync.login(email, password);
  
  document.getElementById('loginBtn').disabled = false;
  document.getElementById('loginBtn').textContent = 'Sign In';
  
  if (result.success) {
    showToast('Signed in successfully! ☁️', 'success');
    await updateSyncUI();
    // Optionally sync from cloud on login
    await handleDownloadFromCloud();
  } else {
    showSyncError(result.error || 'Login failed');
  }
}

async function handleRegister() {
  const email = document.getElementById('registerEmail').value.trim();
  const displayName = document.getElementById('registerDisplayName').value.trim();
  const password = document.getElementById('registerPassword').value;
  
  if (!email || !password) {
    showSyncError('Please enter email and password');
    return;
  }
  
  if (password.length < 6) {
    showSyncError('Password must be at least 6 characters');
    return;
  }
  
  document.getElementById('registerBtn').disabled = true;
  document.getElementById('registerBtn').textContent = 'Creating account...';
  
  const result = await CloudSync.register(email, password, displayName);
  
  document.getElementById('registerBtn').disabled = false;
  document.getElementById('registerBtn').textContent = 'Create Account';
  
  if (result.success) {
    showToast('Account created! Your macros are now syncing ☁️', 'success');
    await updateSyncUI();
  } else {
    showSyncError(result.error || 'Registration failed');
  }
}

async function handleLogout() {
  await CloudSync.logout();
  showToast('Signed out', 'info');
  await updateSyncUI();
}

async function handleSyncNow() {
  const btn = document.getElementById('syncNowBtn');
  btn.disabled = true;
  btn.textContent = '🔄 Syncing...';
  document.getElementById('syncBtn').classList.add('syncing');
  
  const result = await CloudSync.syncToCloud();
  
  btn.disabled = false;
  btn.textContent = '🔄 Sync Now';
  document.getElementById('syncBtn').classList.remove('syncing');
  
  if (result.success) {
    showToast(`Synced ${result.macroCount} macros to cloud! ☁️`, 'success');
    document.getElementById('lastSyncTime').textContent = new Date(result.lastSync).toLocaleString();
  } else {
    showToast('Sync failed: ' + (result.error || 'Unknown error'), 'error');
  }
}

async function handleDownloadFromCloud() {
  const btn = document.getElementById('downloadFromCloudBtn');
  btn.disabled = true;
  btn.textContent = '⬇️ Downloading...';
  
  const result = await CloudSync.syncFromCloud();
  
  btn.disabled = false;
  btn.textContent = '⬇️ Download';
  
  if (result.success) {
    // Reload data
    await loadData();
    showToast('Downloaded macros from cloud! ☁️', 'success');
    document.getElementById('lastSyncTime').textContent = 
      result.data?.lastSync ? new Date(result.data.lastSync).toLocaleString() : 'Just now';
    document.getElementById('syncedMacroCount').textContent = macros.length;
  } else {
    showToast('Download failed: ' + (result.error || 'Unknown error'), 'error');
  }
}

function showSyncError(message) {
  const errorEl = document.getElementById('syncError');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

// Auto-sync when macros change
async function triggerAutoSync() {
  if (await CloudSync.isSyncEnabled() && await CloudSync.isLoggedIn()) {
    // Debounce: wait 2 seconds before syncing
    clearTimeout(window.autoSyncTimeout);
    window.autoSyncTimeout = setTimeout(async () => {
      await CloudSync.syncToCloud();
    }, 2000);
  }
}

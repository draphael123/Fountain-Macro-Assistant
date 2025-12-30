// Popup script for managing macros

let macros = [];
let folders = [];
let macroStats = {};
let currentEditingId = null;
let selectedFolderId = 'all';
let sortBy = 'name';

// Load macros and folders from storage
async function loadMacros() {
  const result = await chrome.storage.sync.get(['macros', 'folders', 'macroStats']);
  macros = result.macros || [];
  folders = result.folders || [];
  macroStats = result.macroStats || {};
  updateFolderSelects();
  renderMacros();
}

// Save macros to storage
async function saveMacros() {
  await chrome.storage.sync.set({ macros });
  renderMacros();
}

// Save folders to storage
async function saveFolders() {
  await chrome.storage.sync.set({ folders });
  updateFolderSelects();
  renderMacros();
}

// Update folder dropdowns
function updateFolderSelects() {
  const folderSelect = document.getElementById('folderSelect');
  const folderFilter = document.getElementById('folderFilter');
  
  // Update folder select in macro modal
  folderSelect.innerHTML = '<option value="">No Folder</option>' +
    folders.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('');
  
  // Update folder filter
  folderFilter.innerHTML = '<option value="all">All Folders</option>' +
    folders.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('');
  
  if (selectedFolderId !== 'all') {
    folderFilter.value = selectedFolderId;
  }
}

// Get folder name by ID
function getFolderName(folderId) {
  if (!folderId) return null;
  const folder = folders.find(f => f.id === folderId);
  return folder ? folder.name : null;
}

// Get macro statistics
function getMacroStats(macroId) {
  return macroStats[macroId] || { count: 0, lastUsed: null };
}

// Format date for display
function formatDate(timestamp) {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString();
}

// Sort macros
function sortMacros(macrosList) {
  return [...macrosList].sort((a, b) => {
    const statsA = getMacroStats(a.id);
    const statsB = getMacroStats(b.id);
    
    switch (sortBy) {
      case 'usage':
        return statsB.count - statsA.count;
      case 'recent':
        return (statsB.lastUsed || 0) - (statsA.lastUsed || 0);
      case 'created':
        return (b.id || '').localeCompare(a.id || '');
      case 'name':
      default:
        return a.shortcut.localeCompare(b.shortcut);
    }
  });
}

// Render macros list
function renderMacros(filter = '') {
  const macrosList = document.getElementById('macrosList');
  const emptyState = document.getElementById('emptyState');
  
  // Filter macros by search and folder
  let filteredMacros = macros.filter(macro => {
    const matchesSearch = !filter || 
      macro.shortcut.toLowerCase().includes(filter.toLowerCase()) ||
      macro.expansion.toLowerCase().includes(filter.toLowerCase());
    
    const matchesFolder = selectedFolderId === 'all' || 
      (selectedFolderId === '' && !macro.folderId) ||
      macro.folderId === selectedFolderId;
    
    return matchesSearch && matchesFolder;
  });
  
  // Sort macros
  filteredMacros = sortMacros(filteredMacros);

  if (filteredMacros.length === 0) {
    macrosList.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  
  // Group macros by folder
  const macrosByFolder = {};
  const noFolderMacros = [];
  
  filteredMacros.forEach(macro => {
    if (macro.folderId) {
      if (!macrosByFolder[macro.folderId]) {
        macrosByFolder[macro.folderId] = [];
      }
      macrosByFolder[macro.folderId].push(macro);
    } else {
      noFolderMacros.push(macro);
    }
  });
  
  // Render grouped by folder
  let html = '';
  
  // Render folders
  Object.keys(macrosByFolder).forEach(folderId => {
    const folderName = getFolderName(folderId);
    if (folderName) {
      html += `
        <div class="folder-section">
          <div class="folder-header">
            <span class="folder-icon">📁</span>
            <span class="folder-name">${escapeHtml(folderName)}</span>
            <span class="folder-count">${macrosByFolder[folderId].length}</span>
          </div>
          <div class="folder-macros">
            ${macrosByFolder[folderId].map(macro => {
              const stats = getMacroStats(macro.id);
              const hasAliases = macro.aliases && macro.aliases.length > 0;
              const hasConditions = macro.conditions && Object.keys(macro.conditions).length > 0;
              return `
              <div class="macro-item" data-id="${macro.id}">
                <div class="macro-header">
                  <div class="macro-shortcut">
                    ${escapeHtml(macro.shortcut)}
                    ${hasAliases ? `<span class="alias-indicator" title="Aliases: ${(macro.aliases || []).join(', ')}">🔗</span>` : ''}
                    ${hasConditions ? `<span class="condition-indicator" title="Has conditional expansions">⚡</span>` : ''}
                  </div>
                  ${stats.count > 0 ? `<span class="usage-badge" title="Used ${stats.count} time${stats.count !== 1 ? 's' : ''}">${stats.count}</span>` : ''}
                </div>
                <div class="macro-expansion">${escapeHtml(macro.expansion)}</div>
                ${stats.lastUsed ? `<div class="macro-meta">Last used: ${formatDate(stats.lastUsed)}</div>` : ''}
              </div>
            `;
            }).join('')}
          </div>
        </div>
      `;
    }
  });
  
  // Render macros without folder
  if (noFolderMacros.length > 0 && (selectedFolderId === 'all' || selectedFolderId === '')) {
    html += `
      <div class="folder-section">
        <div class="folder-header">
          <span class="folder-name">No Folder</span>
          <span class="folder-count">${noFolderMacros.length}</span>
        </div>
        <div class="folder-macros">
          ${noFolderMacros.map(macro => {
            const stats = getMacroStats(macro.id);
            const aliases = macro.aliases && macro.aliases.length > 0 ? ` (aliases: ${macro.aliases.join(', ')})` : '';
            const hasConditions = macro.conditions && Object.keys(macro.conditions).length > 0;
            return `
            <div class="macro-item" data-id="${macro.id}">
              <div class="macro-header">
                <div class="macro-shortcut">
                  ${escapeHtml(macro.shortcut)}
                  ${aliases ? `<span class="alias-indicator" title="Has aliases">🔗</span>` : ''}
                  ${hasConditions ? `<span class="condition-indicator" title="Has conditions">⚡</span>` : ''}
                </div>
                ${stats.count > 0 ? `<span class="usage-badge" title="Used ${stats.count} time${stats.count !== 1 ? 's' : ''}">${stats.count}</span>` : ''}
              </div>
              <div class="macro-expansion">${escapeHtml(macro.expansion)}</div>
              ${stats.lastUsed ? `<div class="macro-meta">Last used: ${formatDate(stats.lastUsed)}</div>` : ''}
            </div>
          `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  macrosList.innerHTML = html;

  // Add click handlers
  document.querySelectorAll('.macro-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      editMacro(id);
    });
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Open modal to add new macro
function addMacro() {
  currentEditingId = null;
  document.getElementById('modalTitle').textContent = 'Add Macro';
  document.getElementById('shortcutInput').value = '';
  document.getElementById('aliasesInput').value = '';
  document.getElementById('expansionInput').value = '';
  document.getElementById('caseSensitiveCheck').checked = false;
  document.getElementById('enableConditionsCheck').checked = false;
  document.getElementById('timeStart').value = '';
  document.getElementById('timeEnd').value = '';
  document.getElementById('weekdayOnlyCheck').checked = false;
  document.getElementById('conditionsPanel').style.display = 'none';
  document.getElementById('conditionalExpansions').innerHTML = '';
  document.getElementById('folderSelect').value = selectedFolderId !== 'all' ? selectedFolderId : '';
  document.getElementById('deleteMacroBtn').style.display = 'none';
  document.getElementById('macroModal').classList.add('active');
  document.getElementById('shortcutInput').focus();
}

// Edit existing macro
function editMacro(id) {
  const macro = macros.find(m => m.id === id);
  if (!macro) return;

  currentEditingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Macro';
  document.getElementById('shortcutInput').value = macro.shortcut;
  document.getElementById('aliasesInput').value = (macro.aliases || []).join(', ');
  document.getElementById('expansionInput').value = macro.expansion;
  document.getElementById('caseSensitiveCheck').checked = macro.caseSensitive || false;
  
  // Load conditions
  const conditions = macro.conditions || {};
  const hasConditions = conditions.timeRange || conditions.days || conditions.weekdayOnly !== undefined || (conditions.expansions && conditions.expansions.length > 0);
  document.getElementById('enableConditionsCheck').checked = hasConditions;
  document.getElementById('conditionsPanel').style.display = hasConditions ? 'block' : 'none';
  
  if (conditions.timeRange) {
    document.getElementById('timeStart').value = conditions.timeRange.start || '';
    document.getElementById('timeEnd').value = conditions.timeRange.end || '';
  }
  document.getElementById('weekdayOnlyCheck').checked = conditions.weekdayOnly || false;
  
  // Load conditional expansions
  document.getElementById('conditionalExpansions').innerHTML = '';
  if (conditions.expansions && conditions.expansions.length > 0) {
    conditions.expansions.forEach((condExp, index) => {
      addConditionalExpansionRow(condExp, index);
    });
  }
  
  document.getElementById('folderSelect').value = macro.folderId || '';
  document.getElementById('deleteMacroBtn').style.display = 'inline-block';
  document.getElementById('macroModal').classList.add('active');
  document.getElementById('shortcutInput').focus();
}

// Save macro (add or update)
async function saveMacro() {
  const shortcut = document.getElementById('shortcutInput').value.trim();
  const aliasesInput = document.getElementById('aliasesInput').value.trim();
  const aliases = aliasesInput ? aliasesInput.split(',').map(a => a.trim()).filter(a => a) : [];
  const expansion = document.getElementById('expansionInput').value.trim();
  const caseSensitive = document.getElementById('caseSensitiveCheck').checked;
  const folderId = document.getElementById('folderSelect').value || null;
  const enableConditions = document.getElementById('enableConditionsCheck').checked;

  if (!shortcut || !expansion) {
    alert('Please fill in both shortcut and expansion fields.');
    return;
  }

  // Check for duplicate shortcuts and aliases (case-insensitive if not case sensitive)
  const allShortcuts = [shortcut, ...aliases];
  const existingMacro = macros.find(m => {
    if (m.id === currentEditingId) return false;
    const mShortcuts = [m.shortcut, ...(m.aliases || [])];
    for (const s of allShortcuts) {
      for (const ms of mShortcuts) {
        if (caseSensitive || m.caseSensitive) {
          if (s === ms) return true;
        } else {
          if (s.toLowerCase() === ms.toLowerCase()) return true;
        }
      }
    }
    return false;
  });

  if (existingMacro) {
    alert('A macro with this shortcut or alias already exists!');
    return;
  }

  // Build conditions object
  let conditions = {};
  if (enableConditions) {
    const timeStart = document.getElementById('timeStart').value;
    const timeEnd = document.getElementById('timeEnd').value;
    const weekdayOnly = document.getElementById('weekdayOnlyCheck').checked;
    
    if (timeStart !== '' || timeEnd !== '') {
      conditions.timeRange = {
        start: timeStart !== '' ? parseInt(timeStart) : undefined,
        end: timeEnd !== '' ? parseInt(timeEnd) : undefined
      };
    }
    
    if (weekdayOnly) {
      conditions.weekdayOnly = true;
    }
    
    // Get conditional expansions
    const condExpansions = [];
    document.querySelectorAll('.conditional-expansion-row').forEach(row => {
      const condExpansion = row.querySelector('.cond-expansion-input').value.trim();
      const condTimeStart = row.querySelector('.cond-time-start').value;
      const condTimeEnd = row.querySelector('.cond-time-end').value;
      const condDay = row.querySelector('.cond-day-select').value;
      const condWeekday = row.querySelector('.cond-weekday').checked;
      
      if (condExpansion) {
        const condExp = { expansion: condExpansion };
        if (condTimeStart !== '' || condTimeEnd !== '') {
          condExp.timeRange = {
            start: condTimeStart !== '' ? parseInt(condTimeStart) : undefined,
            end: condTimeEnd !== '' ? parseInt(condTimeEnd) : undefined
          };
        }
        if (condDay !== '') {
          condExp.day = parseInt(condDay);
        }
        if (condWeekday) {
          condExp.weekdayOnly = true;
        }
        condExpansions.push(condExp);
      }
    });
    
    if (condExpansions.length > 0) {
      conditions.expansions = condExpansions;
    }
  }

  if (currentEditingId) {
    // Update existing macro
    const index = macros.findIndex(m => m.id === currentEditingId);
    macros[index] = {
      id: currentEditingId,
      shortcut,
      aliases: aliases.length > 0 ? aliases : undefined,
      expansion,
      caseSensitive,
      folderId,
      conditions: Object.keys(conditions).length > 0 ? conditions : undefined
    };
  } else {
    // Add new macro
    macros.push({
      id: Date.now().toString(),
      shortcut,
      aliases: aliases.length > 0 ? aliases : undefined,
      expansion,
      caseSensitive,
      folderId,
      conditions: Object.keys(conditions).length > 0 ? conditions : undefined
    });
  }

  await saveMacros();
  closeModal();
}

// Add conditional expansion row
function addConditionalExpansionRow(condExp = null, index = null) {
  const container = document.getElementById('conditionalExpansions');
  const row = document.createElement('div');
  row.className = 'conditional-expansion-row';
  row.innerHTML = `
    <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
      <div class="form-group" style="margin-bottom: 8px;">
        <label style="font-size: 12px;">Expansion:</label>
        <textarea class="cond-expansion-input" placeholder="Expansion text for this condition" rows="2" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;">${condExp ? escapeHtml(condExp.expansion) : ''}</textarea>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
        <div style="flex: 1; min-width: 100px;">
          <label style="font-size: 11px;">Time Start:</label>
          <input type="number" class="cond-time-start" placeholder="Hour (0-23)" min="0" max="23" value="${condExp && condExp.timeRange ? condExp.timeRange.start || '' : ''}" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
        </div>
        <div style="flex: 1; min-width: 100px;">
          <label style="font-size: 11px;">Time End:</label>
          <input type="number" class="cond-time-end" placeholder="Hour (0-23)" min="0" max="23" value="${condExp && condExp.timeRange ? condExp.timeRange.end || '' : ''}" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
        </div>
        <div style="flex: 1; min-width: 100px;">
          <label style="font-size: 11px;">Day:</label>
          <select class="cond-day-select" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
            <option value="">Any day</option>
            <option value="0" ${condExp && condExp.day === 0 ? 'selected' : ''}>Sunday</option>
            <option value="1" ${condExp && condExp.day === 1 ? 'selected' : ''}>Monday</option>
            <option value="2" ${condExp && condExp.day === 2 ? 'selected' : ''}>Tuesday</option>
            <option value="3" ${condExp && condExp.day === 3 ? 'selected' : ''}>Wednesday</option>
            <option value="4" ${condExp && condExp.day === 4 ? 'selected' : ''}>Thursday</option>
            <option value="5" ${condExp && condExp.day === 5 ? 'selected' : ''}>Friday</option>
            <option value="6" ${condExp && condExp.day === 6 ? 'selected' : ''}>Saturday</option>
          </select>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label style="font-size: 12px;">
          <input type="checkbox" class="cond-weekday" ${condExp && condExp.weekdayOnly ? 'checked' : ''} style="margin-right: 4px;">
          Weekdays only
        </label>
        <button type="button" class="remove-cond-btn" style="background: #ea4335; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">Remove</button>
      </div>
    </div>
  `;
  
  container.appendChild(row);
  
  // Add remove handler
  row.querySelector('.remove-cond-btn').addEventListener('click', () => {
    row.remove();
  });
}

// Delete macro
async function deleteMacro() {
  if (!currentEditingId) return;
  
  if (confirm('Are you sure you want to delete this macro?')) {
    macros = macros.filter(m => m.id !== currentEditingId);
    await saveMacros();
    closeModal();
  }
}

// Close modal
function closeModal() {
  document.getElementById('macroModal').classList.remove('active');
  currentEditingId = null;
}

// Folder management
function addFolder() {
  document.getElementById('folderNameInput').value = '';
  document.getElementById('folderModal').classList.add('active');
  document.getElementById('folderNameInput').focus();
}

async function saveFolder() {
  const folderName = document.getElementById('folderNameInput').value.trim();
  
  if (!folderName) {
    alert('Please enter a folder name.');
    return;
  }
  
  // Check for duplicate folder names
  if (folders.some(f => f.name.toLowerCase() === folderName.toLowerCase())) {
    alert('A folder with this name already exists!');
    return;
  }
  
  folders.push({
    id: Date.now().toString(),
    name: folderName
  });
  
  await saveFolders();
  closeFolderModal();
}

function closeFolderModal() {
  document.getElementById('folderModal').classList.remove('active');
}

function closeHelpModal() {
  document.getElementById('helpModal').classList.remove('active');
}

// Show keyboard shortcuts help
function showKeyboardShortcuts() {
  const shortcuts = [
    { key: 'Ctrl/Cmd + N', action: 'New Macro' },
    { key: 'Ctrl/Cmd + F', action: 'Focus Search' },
    { key: 'Ctrl/Cmd + /', action: 'Show Shortcuts' },
    { key: 'Escape', action: 'Close Modal' },
    { key: 'Ctrl/Cmd + Z', action: 'Undo Last Expansion' }
  ];
  
  const helpText = shortcuts.map(s => `${s.key}: ${s.action}`).join('\n');
  alert('Keyboard Shortcuts:\n\n' + helpText);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadMacros();

  // Add macro button
  document.getElementById('addMacroBtn').addEventListener('click', addMacro);
  
  // Add folder button
  document.getElementById('addFolderBtn').addEventListener('click', addFolder);
  
  // Help button
  document.getElementById('helpBtn').addEventListener('click', () => {
    document.getElementById('helpModal').classList.add('active');
  });
  
  // Help modal controls
  document.getElementById('closeHelpModal').addEventListener('click', closeHelpModal);
  document.getElementById('closeHelpBtn').addEventListener('click', closeHelpModal);
  
  // Help navigation
  document.querySelectorAll('.help-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      
      // Update active nav button
      document.querySelectorAll('.help-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show corresponding section
      document.querySelectorAll('.help-section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${section}`).classList.add('active');
    });
  });
  
  // Close help modal on outside click
  document.getElementById('helpModal').addEventListener('click', (e) => {
    if (e.target.id === 'helpModal') {
      closeHelpModal();
    }
  });

  // Folder filter
  document.getElementById('folderFilter').addEventListener('change', (e) => {
    selectedFolderId = e.target.value;
    renderMacros(document.getElementById('searchInput').value);
  });

  // Sort select
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderMacros(document.getElementById('searchInput').value);
  });

  // Search input
  document.getElementById('searchInput').addEventListener('input', (e) => {
    renderMacros(e.target.value);
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: New macro
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
      e.preventDefault();
      addMacro();
    }
    
    // Ctrl/Cmd + F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('searchInput').focus();
    }
    
    // Ctrl/Cmd + /: Show shortcuts help
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      showKeyboardShortcuts();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
      if (document.getElementById('macroModal').classList.contains('active')) {
        closeModal();
      }
      if (document.getElementById('folderModal').classList.contains('active')) {
        closeFolderModal();
      }
    }
  });

  // Macro modal controls
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('saveMacroBtn').addEventListener('click', saveMacro);
  document.getElementById('deleteMacroBtn').addEventListener('click', deleteMacro);

  // Folder modal controls
  document.getElementById('closeFolderModal').addEventListener('click', closeFolderModal);
  document.getElementById('cancelFolderBtn').addEventListener('click', closeFolderModal);
  document.getElementById('saveFolderBtn').addEventListener('click', saveFolder);

  // Close modals on outside click
  document.getElementById('macroModal').addEventListener('click', (e) => {
    if (e.target.id === 'macroModal') {
      closeModal();
    }
  });
  
  document.getElementById('folderModal').addEventListener('click', (e) => {
    if (e.target.id === 'folderModal') {
      closeFolderModal();
    }
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('macroModal').classList.contains('active')) {
        closeModal();
      }
      if (document.getElementById('folderModal').classList.contains('active')) {
        closeFolderModal();
      }
      if (document.getElementById('helpModal').classList.contains('active')) {
        closeHelpModal();
      }
    }
  });
  
  // Enter key to save folder
  document.getElementById('folderNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveFolder();
    }
  });
});

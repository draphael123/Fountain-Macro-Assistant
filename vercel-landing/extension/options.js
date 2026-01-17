// Macro-Assistant - Options Page v3.0

let lightMode = false;

// Theme
async function loadTheme() {
  const result = await chrome.storage.sync.get(['lightMode']);
  lightMode = result.lightMode || false;
  applyTheme();
}

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

// Settings
async function loadSettings() {
  const result = await chrome.storage.sync.get(['settings']);
  const settings = result.settings || {};
  
  document.getElementById('autoExpandCheck').checked = settings.autoExpand !== false;
  document.getElementById('showSuggestionsCheck').checked = settings.showSuggestions !== false;
  document.getElementById('enableNotificationsCheck').checked = settings.enableNotifications === true;
  document.getElementById('typewriterDefaultCheck').checked = settings.typewriterDefault === true;
  document.getElementById('debugModeCheck').checked = settings.debugMode === true;
}

async function saveSettings() {
  const settings = {
    autoExpand: document.getElementById('autoExpandCheck').checked,
    showSuggestions: document.getElementById('showSuggestionsCheck').checked,
    enableNotifications: document.getElementById('enableNotificationsCheck').checked,
    typewriterDefault: document.getElementById('typewriterDefaultCheck').checked,
    debugMode: document.getElementById('debugModeCheck').checked
  };
  await chrome.storage.sync.set({ settings });
  showToast('Settings saved! ✨', 'success');
}

// Toast
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Export JSON
async function exportJSON() {
  const result = await chrome.storage.sync.get(['macros', 'folders', 'counters']);
  const data = {
    macros: result.macros || [],
    folders: result.folders || [],
    counters: result.counters || {},
    exportedAt: new Date().toISOString(),
    version: '3.0.0'
  };
  
  if (!data.macros.length) {
    showToast('No macros to export', 'error');
    return;
  }
  
  download(JSON.stringify(data, null, 2), 'fountain-backup.json', 'application/json');
  showToast(`Exported ${data.macros.length} macros! 📥`, 'success');
}

// Export CSV
async function exportCSV() {
  const result = await chrome.storage.sync.get(['macros']);
  const macros = result.macros || [];
  
  if (!macros.length) {
    showToast('No macros to export', 'error');
    return;
  }
  
  let csv = 'Shortcut,Aliases,Tags,Expansion,Regex,Enabled,Domains\n';
  macros.forEach(m => {
    csv += [
      `"${(m.shortcut || '').replace(/"/g, '""')}"`,
      `"${(m.aliases || []).join('; ').replace(/"/g, '""')}"`,
      `"${(m.tags || []).join('; ').replace(/"/g, '""')}"`,
      `"${(m.expansion || '').replace(/"/g, '""').replace(/\n/g, '\\n')}"`,
      m.isRegex ? 'Yes' : 'No',
      m.enabled !== false ? 'Yes' : 'No',
      `"${(m.domains || []).join('; ')}"`
    ].join(',') + '\n';
  });
  
  download(csv, 'fountain-macros.csv', 'text/csv');
  showToast(`Exported ${macros.length} macros! 📊`, 'success');
}

// Export Text
async function exportText() {
  const result = await chrome.storage.sync.get(['macros']);
  const macros = result.macros || [];
  
  if (!macros.length) {
    showToast('No macros to export', 'error');
    return;
  }
  
  let text = `╔═══════════════════════════════════════════════════════════╗
║             💧 FOUNTAIN MACRO EXPORT                      ║
║             ${new Date().toLocaleString().padEnd(40)}║
╚═══════════════════════════════════════════════════════════╝\n\n`;
  
  macros.forEach((m, i) => {
    text += `━━━ MACRO #${i + 1} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shortcut:   ${m.shortcut}
${m.aliases?.length ? `Aliases:    ${m.aliases.join(', ')}\n` : ''}${m.tags?.length ? `Tags:       ${m.tags.join(', ')}\n` : ''}${m.isRegex ? `Type:       Regex Pattern\n` : ''}${m.domains?.length ? `Domains:    ${m.domains.join(', ')}\n` : ''}
Expansion:
┌─────────────────────────────────────────────────────────────
${m.expansion.split('\n').map(l => '│ ' + l).join('\n')}
└─────────────────────────────────────────────────────────────

`;
  });
  
  text += `═══════════════════════════════════════════════════════════════
Total: ${macros.length} macros
═══════════════════════════════════════════════════════════════`;
  
  download(text, 'fountain-macros.txt', 'text/plain');
  showToast(`Exported ${macros.length} macros! 📄`, 'success');
}

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Import
async function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      let imported = [];
      let importedFolders = [];
      
      if (Array.isArray(data)) {
        imported = data;
      } else if (data.macros) {
        imported = data.macros;
        importedFolders = data.folders || [];
      }
      
      const valid = imported.filter(m => m.id && m.shortcut && m.expansion);
      if (!valid.length) {
        showToast('No valid macros found', 'error');
        return;
      }
      
      const result = await chrome.storage.sync.get(['macros', 'folders']);
      const existing = result.macros || [];
      const existingFolders = result.folders || [];
      
      const existingShortcuts = new Set(existing.map(m => m.shortcut.toLowerCase()));
      const newMacros = valid.filter(m => !existingShortcuts.has(m.shortcut.toLowerCase()));
      
      const existingFolderIds = new Set(existingFolders.map(f => f.id));
      const newFolders = importedFolders.filter(f => !existingFolderIds.has(f.id));
      
      await chrome.storage.sync.set({
        macros: [...existing, ...newMacros],
        folders: [...existingFolders, ...newFolders]
      });
      
      const skipped = valid.length - newMacros.length;
      showToast(`Imported ${newMacros.length} macros${skipped ? `, ${skipped} skipped` : ''} 🎉`, 'success');
      e.target.value = '';
    } catch (err) {
      showToast('Import error: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

// Clear functions
async function clearStats() {
  if (confirm('Reset all usage statistics?')) {
    await chrome.storage.sync.set({ macroStats: {} });
    showToast('Statistics reset! 🔄', 'success');
  }
}

async function clearCounters() {
  if (confirm('Reset all counters?')) {
    await chrome.storage.sync.set({ counters: {} });
    showToast('Counters reset! 🔢', 'success');
  }
}

async function clearAll() {
  if (confirm('⚠️ DELETE ALL MACROS?\n\nThis will permanently delete everything.')) {
    if (confirm('Are you absolutely sure?')) {
      await chrome.storage.sync.set({ macros: [], folders: [], macroStats: {}, counters: {} });
      showToast('All data deleted', 'success');
    }
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadSettings();
  
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  
  ['autoExpandCheck', 'showSuggestionsCheck', 'enableNotificationsCheck', 'typewriterDefaultCheck', 'debugModeCheck'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', saveSettings);
  });
  
  document.getElementById('exportBtn')?.addEventListener('click', exportJSON);
  document.getElementById('exportCSVBtn')?.addEventListener('click', exportCSV);
  document.getElementById('exportTextBtn')?.addEventListener('click', exportText);
  document.getElementById('importInput')?.addEventListener('change', importJSON);
  
  document.getElementById('clearStatsBtn')?.addEventListener('click', clearStats);
  document.getElementById('clearCountersBtn')?.addEventListener('click', clearCounters);
  document.getElementById('clearAllBtn')?.addEventListener('click', clearAll);
});

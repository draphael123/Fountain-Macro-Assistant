// Fountain - Options Page v3.0

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
  const result = await chrome.storage.sync.get(['settings', 'signatureSettings']);
  const settings = result.settings || {};
  const sigSettings = result.signatureSettings || {};
  
  document.getElementById('autoExpandCheck').checked = settings.autoExpand !== false;
  document.getElementById('showSuggestionsCheck').checked = settings.showSuggestions !== false;
  document.getElementById('enableNotificationsCheck').checked = settings.enableNotifications === true;
  document.getElementById('typewriterDefaultCheck').checked = settings.typewriterDefault === true;
  document.getElementById('debugModeCheck').checked = settings.debugMode === true;
  document.getElementById('autoBackupCheck').checked = settings.autoBackup !== false;
  
  // Load signature settings
  document.getElementById('signatureTemplateSelect').value = sigSettings.template || 'professional';
  document.getElementById('sigNameInput').value = sigSettings.name || '';
  document.getElementById('sigTitleInput').value = sigSettings.title || '';
  document.getElementById('sigCompanyInput').value = sigSettings.company || '';
  document.getElementById('sigEmailInput').value = sigSettings.email || '';
  document.getElementById('sigPhoneInput').value = sigSettings.phone || '';
  document.getElementById('sigWebsiteInput').value = sigSettings.website || '';
  document.getElementById('sigMainShortcut').value = sigSettings.shortcuts?.main || '/sig';
  document.getElementById('sigProShortcut').value = sigSettings.shortcuts?.professional || '/sigpro';
  document.getElementById('sigCasualShortcut').value = sigSettings.shortcuts?.casual || '/sigcasual';
  document.getElementById('sigFormalShortcut').value = sigSettings.shortcuts?.formal || '/sigformal';
  document.getElementById('sigIncludeDateCheck').checked = sigSettings.includeDate !== false;
  document.getElementById('sigIncludeSeparatorCheck').checked = sigSettings.includeSeparator !== false;
  document.getElementById('sigAutoCreateCheck').checked = sigSettings.autoCreate === true;
}

async function saveSettings() {
  const settings = {
    autoExpand: document.getElementById('autoExpandCheck').checked,
    showSuggestions: document.getElementById('showSuggestionsCheck').checked,
    enableNotifications: document.getElementById('enableNotificationsCheck').checked,
    typewriterDefault: document.getElementById('typewriterDefaultCheck').checked,
    debugMode: document.getElementById('debugModeCheck').checked,
    autoBackup: document.getElementById('autoBackupCheck').checked
  };
  await chrome.storage.sync.set({ settings });
  showToast('Settings saved! ✨', 'success');
}

// Signature Functions
function generateSignature(template, sigData) {
  const separator = sigData.includeSeparator ? '─────────────────' : '';
  const date = sigData.includeDate ? `\nSent on ${new Date().toLocaleDateString()}` : '';
  
  const templates = {
    professional: `Best regards,${sigData.name ? `\n${sigData.name}` : ''}${sigData.title ? `\n${sigData.title}` : ''}${sigData.company ? `\n${sigData.company}` : ''}${sigData.email ? `\nEmail: ${sigData.email}` : ''}${sigData.phone ? `\nPhone: ${sigData.phone}` : ''}${sigData.website ? `\nWebsite: ${sigData.website}` : ''}${date}${separator ? `\n${separator}` : ''}`,
    
    casual: `Thanks!${sigData.name ? `\n${sigData.name}` : ''}${sigData.email ? `\n${sigData.email}` : ''}${date}${separator ? `\n${separator}` : ''}`,
    
    formal: `Sincerely,${sigData.name ? `\n${sigData.name}` : ''}${sigData.title ? `\n${sigData.title}` : ''}${sigData.company ? `\n${sigData.company}` : ''}${sigData.email ? `\nEmail: ${sigData.email}` : ''}${sigData.phone ? `\nPhone: ${sigData.phone}` : ''}${date}${separator ? `\n${separator}` : ''}`,
    
    minimal: `${sigData.name || ''}${sigData.email ? `\n${sigData.email}` : ''}${date}`,
    
    detailed: `${sigData.name ? `${sigData.name}` : ''}${sigData.title ? `\n${sigData.title}` : ''}${sigData.company ? `\n${sigData.company}` : ''}${separator ? separator : ''}${sigData.email ? `Email: ${sigData.email}` : ''}${sigData.phone ? ` | Phone: ${sigData.phone}` : ''}${sigData.website ? `\nWebsite: ${sigData.website}` : ''}${date ? `\n${date}` : ''}`
  };
  
  return templates[template] || templates.professional;
}

function previewSignature() {
  const template = document.getElementById('signatureTemplateSelect').value;
  const sigData = {
    name: document.getElementById('sigNameInput').value,
    title: document.getElementById('sigTitleInput').value,
    company: document.getElementById('sigCompanyInput').value,
    email: document.getElementById('sigEmailInput').value,
    phone: document.getElementById('sigPhoneInput').value,
    website: document.getElementById('sigWebsiteInput').value,
    includeDate: document.getElementById('sigIncludeDateCheck').checked,
    includeSeparator: document.getElementById('sigIncludeSeparatorCheck').checked
  };
  
  const preview = generateSignature(template, sigData);
  document.getElementById('signaturePreviewContent').textContent = preview;
  document.getElementById('signaturePreview').style.display = 'block';
}

async function saveSignatureSettings() {
  const signatureSettings = {
    template: document.getElementById('signatureTemplateSelect').value,
    name: document.getElementById('sigNameInput').value,
    title: document.getElementById('sigTitleInput').value,
    company: document.getElementById('sigCompanyInput').value,
    email: document.getElementById('sigEmailInput').value,
    phone: document.getElementById('sigPhoneInput').value,
    website: document.getElementById('sigWebsiteInput').value,
    shortcuts: {
      main: document.getElementById('sigMainShortcut').value,
      professional: document.getElementById('sigProShortcut').value,
      casual: document.getElementById('sigCasualShortcut').value,
      formal: document.getElementById('sigFormalShortcut').value
    },
    includeDate: document.getElementById('sigIncludeDateCheck').checked,
    includeSeparator: document.getElementById('sigIncludeSeparatorCheck').checked,
    autoCreate: document.getElementById('sigAutoCreateCheck').checked
  };
  
  await chrome.storage.sync.set({ signatureSettings });
  
  // Auto-create signature macros if enabled
  if (signatureSettings.autoCreate) {
    await createSignatureMacros(signatureSettings);
    showToast('Signature settings saved and macros created! ✨', 'success');
  } else {
    showToast('Signature settings saved! ✨', 'success');
  }
}

async function createSignatureMacros(sigSettings) {
  const result = await chrome.storage.sync.get(['macros']);
  const macros = result.macros || [];
  
  // Remove existing signature macros
  const filteredMacros = macros.filter(m => 
    !m.shortcut.startsWith('/sig') && 
    !m.shortcut.startsWith(sigSettings.shortcuts.main) &&
    !m.shortcut.startsWith(sigSettings.shortcuts.professional) &&
    !m.shortcut.startsWith(sigSettings.shortcuts.casual) &&
    !m.shortcut.startsWith(sigSettings.shortcuts.formal)
  );
  
  const sigData = {
    name: sigSettings.name,
    title: sigSettings.title,
    company: sigSettings.company,
    email: sigSettings.email,
    phone: sigSettings.phone,
    website: sigSettings.website,
    includeDate: sigSettings.includeDate,
    includeSeparator: sigSettings.includeSeparator
  };
  
  // Create main signature
  filteredMacros.push({
    id: Date.now().toString(),
    shortcut: sigSettings.shortcuts.main,
    expansion: generateSignature(sigSettings.template, sigData),
    tags: ['signature'],
    createdAt: new Date().toISOString(),
    enabled: true
  });
  
  // Create style-specific signatures
  ['professional', 'casual', 'formal', 'minimal', 'detailed'].forEach(style => {
    if (style !== sigSettings.template) {
      filteredMacros.push({
        id: (Date.now() + Math.random()).toString(),
        shortcut: sigSettings.shortcuts[style] || `/sig${style.substring(0, 3)}`,
        expansion: generateSignature(style, sigData),
        tags: ['signature', style],
        createdAt: new Date().toISOString(),
        enabled: true
      });
    }
  });
  
  await chrome.storage.sync.set({ macros: filteredMacros });
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

// Backup Now (same as export but with timestamp in filename)
async function backupNow() {
  const result = await chrome.storage.sync.get(['macros', 'folders', 'counters', 'signatureSettings']);
  const data = {
    macros: result.macros || [],
    folders: result.folders || [],
    counters: result.counters || {},
    signatureSettings: result.signatureSettings || {},
    exportedAt: new Date().toISOString(),
    version: chrome.runtime.getManifest().version,
    type: 'manual_backup'
  };
  
  if (!data.macros.length) {
    showToast('No macros to backup', 'error');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `fountain-backup-${timestamp}.json`;
  download(JSON.stringify(data, null, 2), filename, 'application/json');
  showToast(`Backup created: ${filename} ✨`, 'success');
}

// Export JSON
async function exportJSON() {
  const result = await chrome.storage.sync.get(['macros', 'folders', 'counters']);
  const data = {
    macros: result.macros || [],
    folders: result.folders || [],
    counters: result.counters || {},
    exportedAt: new Date().toISOString(),
    version: chrome.runtime.getManifest().version
  };
  
  if (!data.macros.length) {
    showToast('No macros to export', 'error');
    return;
  }
  
  download(JSON.stringify(data, null, 2), 'fountain-backup.json', 'application/json');
  showToast(`Exported ${data.macros.length} macros! 📥`, 'success');
}

// Restore Auto-Backups
async function restoreAutoBackups() {
  try {
    const allData = await chrome.storage.local.get(null);
    const backupKeys = Object.keys(allData).filter(k => k.startsWith('auto_backup_')).sort().reverse();
    
    if (backupKeys.length === 0) {
      showToast('No automatic backups found', 'error');
      return;
    }
    
    // Show backup selection dialog
    const backups = backupKeys.map(key => ({
      key,
      data: allData[key],
      date: new Date(allData[key].backedUpAt).toLocaleString(),
      macroCount: (allData[key].macros || []).length,
      version: allData[key].extensionVersion || 'unknown'
    }));
    
    const backupList = backups.map((b, i) => 
      `\n${i + 1}. ${b.date} - ${b.macroCount} macros (v${b.version})`
    ).join('');
    
    const selected = prompt(
      `Found ${backups.length} automatic backup(s):${backupList}\n\nEnter number to restore (or cancel):`,
      '1'
    );
    
    if (!selected || isNaN(selected) || selected < 1 || selected > backups.length) {
      return;
    }
    
    const backupToRestore = backups[parseInt(selected) - 1];
    
    if (confirm(`Restore backup from ${backupToRestore.date}?\n\nThis will replace your current macros (${backupToRestore.macroCount} macros).`)) {
      await chrome.storage.sync.set({
        macros: backupToRestore.data.macros || [],
        folders: backupToRestore.data.folders || [],
        counters: backupToRestore.data.counters || {},
        signatureSettings: backupToRestore.data.signatureSettings || {}
      });
      showToast(`Restored backup from ${backupToRestore.date}! ✨`, 'success');
      // Reload page to show restored data
      setTimeout(() => location.reload(), 1000);
    }
  } catch (error) {
    console.error('Restore error:', error);
    showToast('Error restoring backup: ' + error.message, 'error');
  }
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
  
  ['autoExpandCheck', 'showSuggestionsCheck', 'enableNotificationsCheck', 'typewriterDefaultCheck', 'debugModeCheck', 'autoBackupCheck'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', saveSettings);
  });
  
  document.getElementById('backupNowBtn')?.addEventListener('click', backupNow);
  document.getElementById('exportBtn')?.addEventListener('click', exportJSON);
  document.getElementById('restoreBackupBtn')?.addEventListener('click', restoreAutoBackups);
  document.getElementById('exportCSVBtn')?.addEventListener('click', exportCSV);
  document.getElementById('exportTextBtn')?.addEventListener('click', exportText);
  document.getElementById('importInput')?.addEventListener('change', importJSON);
  
  document.getElementById('clearStatsBtn')?.addEventListener('click', clearStats);
  document.getElementById('clearCountersBtn')?.addEventListener('click', clearCounters);
  document.getElementById('clearAllBtn')?.addEventListener('click', clearAll);
  
  // Signature options
  document.getElementById('previewSignatureBtn')?.addEventListener('click', previewSignature);
  document.getElementById('saveSignatureBtn')?.addEventListener('click', saveSignatureSettings);
  document.getElementById('signatureTemplateSelect')?.addEventListener('change', previewSignature);
  
  // Auto-preview when signature fields change
  ['sigNameInput', 'sigTitleInput', 'sigCompanyInput', 'sigEmailInput', 'sigPhoneInput', 'sigWebsiteInput', 'sigIncludeDateCheck', 'sigIncludeSeparatorCheck'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', previewSignature);
    document.getElementById(id)?.addEventListener('change', previewSignature);
  });
});

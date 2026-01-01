// Options page script

// Dark mode functionality
let darkMode = false;

async function loadTheme() {
  const result = await chrome.storage.sync.get(['darkMode']);
  darkMode = result.darkMode || false;
  applyTheme();
}

async function saveTheme() {
  await chrome.storage.sync.set({ darkMode });
}

function applyTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  
  if (darkMode) {
    body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️';
  } else {
    body.classList.remove('dark-mode');
    if (themeToggle) themeToggle.textContent = '🌙';
  }
}

function toggleTheme() {
  darkMode = !darkMode;
  applyTheme();
  saveTheme();
}

// Load settings
async function loadSettings() {
  const result = await chrome.storage.sync.get(['settings']);
  const settings = result.settings || {
    autoExpand: true,
    enableNotifications: false,
    debugMode: false
  };

  document.getElementById('autoExpandCheck').checked = settings.autoExpand !== false;
  document.getElementById('enableNotificationsCheck').checked = settings.enableNotifications === true;
  if (document.getElementById('debugModeCheck')) {
    document.getElementById('debugModeCheck').checked = settings.debugMode === true;
  }
}

// Save settings
async function saveSettings() {
  const settings = {
    autoExpand: document.getElementById('autoExpandCheck').checked,
    enableNotifications: document.getElementById('enableNotificationsCheck').checked,
    debugMode: document.getElementById('debugModeCheck') ? document.getElementById('debugModeCheck').checked : false
  };
  await chrome.storage.sync.set({ settings });
}

// Export macros
async function exportMacros() {
  const result = await chrome.storage.sync.get(['macros']);
  const macros = result.macros || [];
  
  const dataStr = JSON.stringify(macros, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `fountain-macro-assistant-macros-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Export macros as CSV
async function exportMacrosCSV() {
  const result = await chrome.storage.sync.get(['macros']);
  const macros = result.macros || [];
  
  if (macros.length === 0) {
    alert('No macros to export.');
    return;
  }
  
  // CSV header
  let csv = 'Shortcut,Aliases,Tags,Expansion,Case Sensitive,Folder\n';
  
  // CSV rows
  macros.forEach(macro => {
    const shortcut = `"${(macro.shortcut || '').replace(/"/g, '""')}"`;
    const aliases = `"${(macro.aliases || []).join(', ').replace(/"/g, '""')}"`;
    const tags = `"${(macro.tags || []).join(', ').replace(/"/g, '""')}"`;
    const expansion = `"${(macro.expansion || '').replace(/"/g, '""').replace(/\n/g, '\\n')}"`;
    const caseSensitive = macro.caseSensitive ? 'Yes' : 'No';
    const folder = `"${(macro.folderId || '').replace(/"/g, '""')}"`;
    
    csv += `${shortcut},${aliases},${tags},${expansion},${caseSensitive},${folder}\n`;
  });
  
  const dataBlob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `fountain-macro-assistant-macros-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Export macros as plain text
async function exportMacrosPlainText() {
  const result = await chrome.storage.sync.get(['macros']);
  const macros = result.macros || [];
  
  if (macros.length === 0) {
    alert('No macros to export.');
    return;
  }
  
  let text = 'Fountain - Macro Assistant Export\n';
  text += '=====================================\n\n';
  
  macros.forEach((macro, index) => {
    text += `Macro ${index + 1}:\n`;
    text += `Shortcut: ${macro.shortcut}\n`;
    if (macro.aliases && macro.aliases.length > 0) {
      text += `Aliases: ${macro.aliases.join(', ')}\n`;
    }
    if (macro.tags && macro.tags.length > 0) {
      text += `Tags: ${macro.tags.join(', ')}\n`;
    }
    text += `Expansion: ${macro.expansion}\n`;
    if (macro.caseSensitive) {
      text += `Case Sensitive: Yes\n`;
    }
    text += '\n';
  });
  
  const dataBlob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `fountain-macro-assistant-macros-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Import macros
async function importMacros(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedMacros = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedMacros)) {
        throw new Error('Invalid file format');
      }

      // Validate macro structure
      const validMacros = importedMacros.filter(macro => 
        macro.id && macro.shortcut && macro.expansion
      );

      if (validMacros.length === 0) {
        alert('No valid macros found in the file.');
        return;
      }

      // Merge with existing macros (avoid duplicates)
      const result = await chrome.storage.sync.get(['macros']);
      const existingMacros = result.macros || [];
      
      const existingShortcuts = new Set(
        existingMacros.map(m => m.shortcut.toLowerCase())
      );

      const newMacros = validMacros.filter(m => 
        !existingShortcuts.has(m.shortcut.toLowerCase())
      );

      const mergedMacros = [...existingMacros, ...newMacros];
      
      await chrome.storage.sync.set({ macros: mergedMacros });
      
      alert(`Imported ${newMacros.length} new macro(s). ${validMacros.length - newMacros.length} duplicate(s) were skipped.`);
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      alert('Error importing macros: ' + error.message);
    }
  };
  
  reader.readAsText(file);
}

// Clear all macros
async function clearAllMacros() {
  if (confirm('Are you sure you want to delete ALL macros? This action cannot be undone.')) {
    await chrome.storage.sync.set({ macros: [] });
    alert('All macros have been deleted.');
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadSettings();
  
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Settings checkboxes
  document.getElementById('autoExpandCheck').addEventListener('change', saveSettings);
  document.getElementById('enableNotificationsCheck').addEventListener('change', saveSettings);
  const debugCheck = document.getElementById('debugModeCheck');
  if (debugCheck) {
    debugCheck.addEventListener('change', saveSettings);
  }

  // Export buttons
  document.getElementById('exportBtn').addEventListener('click', exportMacros);
  document.getElementById('exportCSVBtn').addEventListener('click', exportMacrosCSV);
  document.getElementById('exportTextBtn').addEventListener('click', exportMacrosPlainText);

  // Import button
  document.getElementById('importInput').addEventListener('change', importMacros);
  document.querySelector('label[for="importInput"]').addEventListener('click', () => {
    document.getElementById('importInput').click();
  });

  // Clear all button
  document.getElementById('clearAllBtn').addEventListener('click', clearAllMacros);
});


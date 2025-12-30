// Options page script

// Load settings
async function loadSettings() {
  const result = await chrome.storage.sync.get(['settings']);
  const settings = result.settings || {
    autoExpand: true,
    enableNotifications: false
  };

  document.getElementById('autoExpandCheck').checked = settings.autoExpand !== false;
  document.getElementById('enableNotificationsCheck').checked = settings.enableNotifications === true;
}

// Save settings
async function saveSettings() {
  const settings = {
    autoExpand: document.getElementById('autoExpandCheck').checked,
    enableNotifications: document.getElementById('enableNotificationsCheck').checked
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
  loadSettings();

  // Settings checkboxes
  document.getElementById('autoExpandCheck').addEventListener('change', saveSettings);
  document.getElementById('enableNotificationsCheck').addEventListener('change', saveSettings);

  // Export button
  document.getElementById('exportBtn').addEventListener('click', exportMacros);

  // Import button
  document.getElementById('importInput').addEventListener('change', importMacros);
  document.querySelector('label[for="importInput"]').addEventListener('click', () => {
    document.getElementById('importInput').click();
  });

  // Clear all button
  document.getElementById('clearAllBtn').addEventListener('click', clearAllMacros);
});


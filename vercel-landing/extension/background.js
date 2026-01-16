// Fountain - Macro Assistant v3.0 - Background Service Worker

// Auto-backup on update
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update') {
    console.log('💧 Fountain updated! Creating automatic backup...');
    
    try {
      // Check if auto-backup is enabled
      const result = await chrome.storage.sync.get(['settings', 'macros', 'folders', 'counters', 'signatureSettings']);
      const settings = result.settings || {};
      
      // Create backup if auto-backup is enabled (default: true)
      if (settings.autoBackup !== false) {
        const backupData = {
          macros: result.macros || [],
          folders: result.folders || [],
          counters: result.counters || {},
          signatureSettings: result.signatureSettings || {},
          backedUpAt: new Date().toISOString(),
          extensionVersion: chrome.runtime.getManifest().version,
          reason: 'automatic_update_backup'
        };
        
        // Store backup in local storage (has more space than sync)
        const backupKey = `auto_backup_${Date.now()}`;
        await chrome.storage.local.set({ [backupKey]: backupData });
        
        // Keep only last 5 backups
        const allKeys = Object.keys(await chrome.storage.local.get(null));
        const backupKeys = allKeys.filter(k => k.startsWith('auto_backup_')).sort().reverse();
        if (backupKeys.length > 5) {
          for (let i = 5; i < backupKeys.length; i++) {
            await chrome.storage.local.remove(backupKeys[i]);
          }
        }
        
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: '💧 Fountain Updated',
          message: `Your macros were automatically backed up (${backupData.macros.length} macros saved)`,
          buttons: [{ title: 'Export Backup' }]
        });
        
        console.log('💧 Automatic backup created:', backupKey);
      }
    } catch (error) {
      console.error('💧 Backup error:', error);
    }
  }
  
  console.log('💧 Fountain installed!');
  
  // Create context menus
  chrome.contextMenus.create({
    id: 'addMacroFromSelection',
    title: '💧 Create macro from selection',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'addMacroFromClipboard',
    title: '💧 Create macro from clipboard',
    contexts: ['editable']
  });
  
  chrome.contextMenus.create({
    id: 'openFountain',
    title: '💧 Open Fountain',
    contexts: ['all']
  });
  
  // Initialize settings
  chrome.storage.sync.get(['settings'], result => {
    if (!result.settings) {
      chrome.storage.sync.set({
        settings: {
          autoExpand: true,
          showSuggestions: true,
          enableNotifications: false,
          typewriterDefault: false,
          debugMode: false
        }
      });
    }
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId === 'addMacroFromSelection' && info.selectionText) {
      // Store the selection for popup to use
      await chrome.storage.local.set({
        pendingMacro: {
          expansion: info.selectionText,
          source: 'selection'
        }
      });
      chrome.action.openPopup();
    } else if (info.menuItemId === 'addMacroFromClipboard') {
      // Store flag for popup
      await chrome.storage.local.set({
        pendingMacro: {
          source: 'clipboard'
        }
      });
      chrome.action.openPopup();
    } else if (info.menuItemId === 'openFountain') {
      chrome.action.openPopup();
    }
  } catch (e) {
    console.error('💧 Fountain context menu error:', e);
  }
});

// Command handler
chrome.commands.onCommand.addListener(async (command) => {
  console.log('💧 Fountain command:', command);
  
  try {
    if (command === 'create_macro') {
      await chrome.storage.local.set({
        pendingMacro: {
          source: 'quick_create'
        }
      });
      chrome.action.openPopup();
    }
  } catch (e) {
    console.error('💧 Fountain command error:', e);
  }
});

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStats') {
    handleStatsUpdate(request.macroId);
    sendResponse({ success: true });
  }
  return true;
});

// Handle backup notification click
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // User clicked "Export Backup"
    // Get the latest backup
    const allData = await chrome.storage.local.get(null);
    const backupKeys = Object.keys(allData).filter(k => k.startsWith('auto_backup_')).sort().reverse();
    
    if (backupKeys.length > 0) {
      const latestBackup = allData[backupKeys[0]];
      // Trigger download (this would need to be handled by opening options page)
      chrome.runtime.openOptionsPage();
    }
  }
  
  chrome.notifications.clear(notificationId);
});

async function handleStatsUpdate(macroId) {
  try {
    const result = await chrome.storage.sync.get(['macroStats']);
    const stats = result.macroStats || {};
    if (!stats[macroId]) stats[macroId] = { count: 0 };
    stats[macroId].count++;
    stats[macroId].lastUsed = Date.now();
    await chrome.storage.sync.set({ macroStats: stats });
  } catch (e) {
    console.error('💧 Fountain stats error:', e);
  }
}

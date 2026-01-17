// Macro-Assistant - Macro Assistant v3.0 - Background Service Worker

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  console.log('💧 Macro-Assistant installed!');
  
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
    id: 'openMacro-Assistant',
    title: '💧 Open Macro-Assistant',
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
    } else if (info.menuItemId === 'openMacro-Assistant') {
      chrome.action.openPopup();
    }
  } catch (e) {
    console.error('💧 Macro-Assistant context menu error:', e);
  }
});

// Command handler
chrome.commands.onCommand.addListener(async (command) => {
  console.log('💧 Macro-Assistant command:', command);
  
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
    console.error('💧 Macro-Assistant command error:', e);
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

async function handleStatsUpdate(macroId) {
  try {
    const result = await chrome.storage.sync.get(['macroStats']);
    const stats = result.macroStats || {};
    if (!stats[macroId]) stats[macroId] = { count: 0 };
    stats[macroId].count++;
    stats[macroId].lastUsed = Date.now();
    await chrome.storage.sync.set({ macroStats: stats });
  } catch (e) {
    console.error('💧 Macro-Assistant stats error:', e);
  }
}

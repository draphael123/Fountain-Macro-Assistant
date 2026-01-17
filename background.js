// Background script for context menu

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'addMacroFromSelection',
    title: 'Add as Macro: "%s"',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'addMacroFromClipboard',
    title: 'Add Macro from Clipboard',
    contexts: ['page', 'editable']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'addMacroFromSelection') {
    const selectedText = info.selectionText;
    if (selectedText) {
      // Open extension popup or create macro directly
      chrome.storage.sync.get(['macros'], async (result) => {
        const macros = result.macros || [];
        const newMacro = {
          id: Date.now().toString(),
          shortcut: selectedText.substring(0, 20), // Use first 20 chars as shortcut
          expansion: selectedText,
          caseSensitive: false
        };
        macros.push(newMacro);
        await chrome.storage.sync.set({ macros });
        
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Macro Added',
          message: `Added "${selectedText.substring(0, 30)}..." as a macro`
        });
      });
    }
  } else if (info.menuItemId === 'addMacroFromClipboard') {
    // This would require clipboard API which needs additional permissions
    // For now, just open the extension
    chrome.action.openPopup();
  }
});











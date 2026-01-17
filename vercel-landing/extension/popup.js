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
let compactMode = false;
let hoverTimeout = null;
let currentTooltip = null;

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

// Packages with actual macros
const PACKAGES = [
  { 
    icon: '🎧', 
    name: 'Customer Service', 
    desc: 'Support replies & templates', 
    author: 'Fountain',
    macros: [
      { shortcut: '/csgreeting', expansion: 'Hello! Thank you for contacting us. How can I help you today?' },
      { shortcut: '/cshold', expansion: 'Thank you for your patience. I\'m looking into this for you right now and will have an update shortly.' },
      { shortcut: '/csresolve', expansion: 'I\'m happy to let you know that this issue has been resolved! Is there anything else I can help you with today?' },
      { shortcut: '/csescalate', expansion: 'I understand this is important to you. Let me escalate this to our specialized team who can better assist you. You\'ll hear back within {input:timeframe}.' },
      { shortcut: '/csapology', expansion: 'I sincerely apologize for the inconvenience this has caused. We take this seriously and are working to make it right.' },
      { shortcut: '/csrefund', expansion: 'I\'ve processed your refund request. You should see the amount credited to your account within 5-10 business days.' },
      { shortcut: '/csfollow', expansion: 'Thank you for bringing this to our attention. I\'ll follow up with you within {input:timeframe} with an update.' },
      { shortcut: '/csclose', expansion: 'Is there anything else I can help you with today? If not, I hope you have a wonderful day! 😊' }
    ]
  },
  { 
    icon: '📣', 
    name: 'Marketing', 
    desc: 'Campaigns & social copy', 
    author: 'Fountain',
    macros: [
      { shortcut: '/mktcta', expansion: '🚀 {input:Action verb} now and get {input:offer}! Limited time only.' },
      { shortcut: '/mktsocial', expansion: '✨ {input:Hook}\n\n{cursor}\n\n👇 Link in bio!\n\n#marketing #growth #business' },
      { shortcut: '/mktemail', expansion: 'Subject: {input:Subject}\n\nHi {input:Name},\n\n{cursor}\n\nBest,\n{input:Your Name}' },
      { shortcut: '/mkturgent', expansion: '⏰ LAST CHANCE! Only {input:time} left to grab {input:offer}. Don\'t miss out!' },
      { shortcut: '/mkttesti', expansion: '"[Customer quote here]"\n— {input:Customer Name}, {input:Title/Company}' },
      { shortcut: '/mktfeature', expansion: '✅ {input:Feature 1}\n✅ {input:Feature 2}\n✅ {input:Feature 3}\n\n👉 Get started today!' },
      { shortcut: '/mktthread', expansion: '🧵 THREAD: {input:Topic}\n\n1/ {cursor}' },
      { shortcut: '/mktnews', expansion: '📰 Newsletter Update\n\nHey {input:Name}!\n\nHere\'s what\'s new this week:\n\n{cursor}' }
    ]
  },
  { 
    icon: '💻', 
    name: 'Developer', 
    desc: 'Code snippets & comments', 
    author: 'Fountain',
    macros: [
      { shortcut: '/devtodo', expansion: '// TODO [{date:YYYY-MM-DD}]: {input:Description}' },
      { shortcut: '/devfix', expansion: '// FIXME: {input:Issue description}' },
      { shortcut: '/devnote', expansion: '// NOTE: {input:Note}' },
      { shortcut: '/devclog', expansion: 'console.log(\'{input:label}:\', {cursor});' },
      { shortcut: '/devfunc', expansion: 'function {input:name}({input:params}) {\n  {cursor}\n}' },
      { shortcut: '/devasync', expansion: 'async function {input:name}({input:params}) {\n  try {\n    {cursor}\n  } catch (error) {\n    console.error(error);\n  }\n}' },
      { shortcut: '/devpr', expansion: '## Description\n{input:What does this PR do?}\n\n## Changes\n- {cursor}\n\n## Testing\n- [ ] Unit tests\n- [ ] Manual testing' },
      { shortcut: '/devcommit', expansion: '{input:type}({input:scope}): {input:description}' }
    ]
  },
  { 
    icon: '💰', 
    name: 'Sales', 
    desc: 'Outreach & follow-ups', 
    author: 'Fountain',
    macros: [
      { shortcut: '/salesintro', expansion: 'Hi {input:Name},\n\nI noticed {input:observation} and thought you might be interested in {input:value prop}.\n\nWould you have 15 minutes this week for a quick chat?\n\nBest,\n{input:Your Name}' },
      { shortcut: '/salesfollow', expansion: 'Hi {input:Name},\n\nJust following up on my previous message. I\'d love to show you how we can help with {input:pain point}.\n\nAre you available for a brief call this week?' },
      { shortcut: '/salesdemo', expansion: 'Great speaking with you! As promised, here\'s the link to schedule your demo: {input:link}\n\nLooking forward to showing you {input:product}!' },
      { shortcut: '/salesprice', expansion: 'Based on our conversation, here\'s the pricing breakdown:\n\n{input:Package}: ${input:price}/month\n\nThis includes:\n• {input:Feature 1}\n• {input:Feature 2}\n• {input:Feature 3}' },
      { shortcut: '/salesclose', expansion: 'Ready to get started? Here\'s what happens next:\n\n1. Sign the agreement\n2. Complete onboarding\n3. Start seeing results!\n\nAny questions before we proceed?' },
      { shortcut: '/salesobj', expansion: 'I completely understand your concern about {input:objection}. What I can tell you is {input:response}.' }
    ]
  },
  { 
    icon: '📋', 
    name: 'HR & Recruiting', 
    desc: 'Hiring & communications', 
    author: 'Fountain',
    macros: [
      { shortcut: '/hrscreen', expansion: 'Hi {input:Name},\n\nThank you for applying for the {input:Position} role. We\'d like to schedule a screening call.\n\nAre you available {input:times}?' },
      { shortcut: '/hrinterview', expansion: 'Congratulations! We\'d like to invite you for an interview for the {input:Position} role.\n\nDate: {input:Date}\nTime: {input:Time}\nLocation: {input:Location/Link}' },
      { shortcut: '/hroffer', expansion: 'We\'re excited to extend an offer for the {input:Position} position!\n\nSalary: {input:Salary}\nStart Date: {input:Date}\n\nPlease review the attached offer letter.' },
      { shortcut: '/hrreject', expansion: 'Thank you for your interest in {input:Position}. After careful consideration, we\'ve decided to move forward with other candidates. We\'ll keep your resume on file for future opportunities.' },
      { shortcut: '/hronboard', expansion: 'Welcome to the team! 🎉\n\nYour first day is {input:Date}. Please bring:\n• ID documents\n• Completed paperwork\n\nWe\'re excited to have you!' },
      { shortcut: '/hrreview', expansion: 'Performance Review - {input:Name}\nDate: {date}\n\nStrengths:\n• {cursor}\n\nAreas for Growth:\n• \n\nGoals:' }
    ]
  },
  { 
    icon: '🎓', 
    name: 'Education', 
    desc: 'Teaching & academic', 
    author: 'Fountain',
    macros: [
      { shortcut: '/edufeedback', expansion: 'Great work on {input:assignment}! You showed strong understanding of {input:concept}. For next time, consider {input:improvement}.' },
      { shortcut: '/eduremind', expansion: 'Reminder: {input:Assignment} is due on {input:Date}. Please submit via {input:platform}.' },
      { shortcut: '/educite', expansion: '{input:Author} ({input:Year}). {input:Title}. {input:Journal/Publisher}.' },
      { shortcut: '/eduoffice', expansion: 'Office Hours:\n{input:Day}: {input:Time}\nLocation: {input:Room/Link}\n\nPlease email ahead to confirm.' },
      { shortcut: '/edugrade', expansion: 'Grade: {input:Grade}\n\nFeedback:\n{cursor}\n\nPlease see me during office hours if you have questions.' },
      { shortcut: '/edusyllabus', expansion: 'Week {input:Number}: {input:Topic}\nReadings: {input:Readings}\nAssignment: {input:Assignment}' }
    ]
  },
  { 
    icon: '🏠', 
    name: 'Personal', 
    desc: 'Everyday shortcuts', 
    author: 'Fountain',
    macros: [
      { shortcut: '/myemail', expansion: '{input:Your Email}' },
      { shortcut: '/myphone', expansion: '{input:Your Phone}' },
      { shortcut: '/myaddr', expansion: '{input:Street}\n{input:City}, {input:State} {input:ZIP}' },
      { shortcut: '/shrug', expansion: '¯\\_(ツ)_/¯' },
      { shortcut: '/tableflip', expansion: '(╯°□°)╯︵ ┻━┻' },
      { shortcut: '/lenny', expansion: '( ͡° ͜ʖ ͡°)' },
      { shortcut: '/check', expansion: '✓' },
      { shortcut: '/x', expansion: '✗' },
      { shortcut: '/arrow', expansion: '→' },
      { shortcut: '/bullet', expansion: '•' },
      { shortcut: '/rsvp', expansion: 'Thank you for the invitation! I would be happy to attend. Please count me in.' },
      { shortcut: '/decline', expansion: 'Thank you for thinking of me, but unfortunately I won\'t be able to make it. I hope you have a wonderful time!' }
    ]
  },
  { 
    icon: '🏥', 
    name: 'Healthcare', 
    desc: 'Medical & wellness', 
    author: 'Fountain',
    macros: [
      { shortcut: '/hcappt', expansion: 'Appointment Confirmation\n\nPatient: {input:Name}\nDate: {input:Date}\nTime: {input:Time}\nProvider: {input:Doctor}\n\nPlease arrive 15 minutes early.' },
      { shortcut: '/hcremind', expansion: 'Reminder: Your appointment with {input:Doctor} is scheduled for {input:Date} at {input:Time}. Please call to reschedule if needed.' },
      { shortcut: '/hcfollow', expansion: 'Following up on your recent visit. How are you feeling? Please don\'t hesitate to reach out if you have any questions or concerns.' },
      { shortcut: '/hcrefill', expansion: 'Your prescription refill for {input:Medication} is ready for pickup at {input:Pharmacy}.' },
      { shortcut: '/hcresults', expansion: 'Your test results are in. Please schedule a follow-up appointment to discuss them with your provider.' },
      { shortcut: '/hcvitals', expansion: 'Vitals: BP {input:BP} | HR {input:HR} | Temp {input:Temp} | SpO2 {input:SpO2}' }
    ]
  },
  { 
    icon: '⚖️', 
    name: 'Legal', 
    desc: 'Legal & compliance', 
    author: 'Fountain',
    macros: [
      { shortcut: '/legaldisclaim', expansion: 'This communication is for informational purposes only and does not constitute legal advice. Please consult with a qualified attorney for specific legal questions.' },
      { shortcut: '/legalconf', expansion: 'CONFIDENTIAL: This message contains privileged and confidential information intended only for the named recipient. If you received this in error, please notify the sender immediately and delete this message.' },
      { shortcut: '/legalretain', expansion: 'Please retain this document for your records. This notice serves as confirmation of {input:matter}.' },
      { shortcut: '/legalconsult', expansion: 'Thank you for contacting our office. We would like to schedule a consultation to discuss your matter.\n\nAvailable times:\n{input:Times}\n\nPlease let us know what works best for you.' },
      { shortcut: '/legaldeadline', expansion: '⚠️ DEADLINE REMINDER\n\nMatter: {input:Matter}\nDeadline: {input:Date}\nAction Required: {input:Action}' }
    ]
  },
  { 
    icon: '🏡', 
    name: 'Real Estate', 
    desc: 'Property & listings', 
    author: 'Fountain',
    macros: [
      { shortcut: '/relisting', expansion: '🏠 {input:Property Type} FOR {input:Sale/Rent}\n\n📍 {input:Address}\n💰 ${input:Price}\n🛏️ {input:Beds} Beds | 🛁 {input:Baths} Baths\n📐 {input:SqFt} sq ft\n\n{cursor}' },
      { shortcut: '/reshowing', expansion: 'Showing Scheduled!\n\nProperty: {input:Address}\nDate: {input:Date}\nTime: {input:Time}\n\nPlease confirm your attendance.' },
      { shortcut: '/reoffer', expansion: 'Congratulations! You\'ve received an offer on {input:Address}.\n\nOffer: ${input:Amount}\nContingencies: {input:Contingencies}\nClosing Date: {input:Date}' },
      { shortcut: '/reclose', expansion: 'Congratulations on your new home! 🎉\n\nClosing Date: {input:Date}\nTime: {input:Time}\nLocation: {input:Location}\n\nPlease bring:\n• Photo ID\n• Certified funds' },
      { shortcut: '/refollow', expansion: 'Hi {input:Name},\n\nFollowing up on your property search. I found some great new listings that match your criteria. Would you like to schedule viewings?' }
    ]
  },
  { 
    icon: '🛒', 
    name: 'E-commerce', 
    desc: 'Online store replies', 
    author: 'Fountain',
    macros: [
      { shortcut: '/ecship', expansion: 'Great news! Your order #{input:Order Number} has shipped! 📦\n\nTracking: {input:Tracking Number}\nEstimated Delivery: {input:Date}\n\nTrack your package: {input:Tracking URL}' },
      { shortcut: '/ecrefund', expansion: 'Your refund for order #{input:Order Number} has been processed. You should see ${input:Amount} credited to your account within 5-7 business days.' },
      { shortcut: '/ecstock', expansion: 'Good news! {input:Product} is back in stock! Get yours before they sell out again: {input:Link}' },
      { shortcut: '/ecreview', expansion: 'We hope you\'re enjoying your purchase! Would you mind taking a moment to leave a review? Your feedback helps other customers and helps us improve. ⭐' },
      { shortcut: '/ecabandon', expansion: 'Hi! We noticed you left some items in your cart. Complete your purchase today and enjoy {input:Discount}% off with code: {input:Code}' },
      { shortcut: '/ecdelay', expansion: 'We apologize for the delay with your order #{input:Order Number}. Due to {input:Reason}, your new estimated delivery is {input:Date}. Thank you for your patience.' }
    ]
  },
  { 
    icon: '📱', 
    name: 'Social Media', 
    desc: 'Posts & engagement', 
    author: 'Fountain',
    macros: [
      { shortcut: '/smhashtags', expansion: '#{input:Topic} #{input:Related1} #{input:Related2} #{input:Related3} #{input:Related4}' },
      { shortcut: '/smlaunch', expansion: '🚀 IT\'S FINALLY HERE!\n\n{input:Product/Feature} is now live!\n\nWe\'ve been working hard on this and can\'t wait for you to try it.\n\n{cursor}\n\n🔗 Link in bio!' },
      { shortcut: '/smbts', expansion: '👀 Behind the scenes look at {input:what}!\n\n{cursor}\n\nWhat would you like to see more of? Let us know in the comments! 👇' },
      { shortcut: '/smqa', expansion: 'Q&A Time! 🙋\n\nDrop your questions below and we\'ll answer them in our next {input:post/video/story}!\n\n{cursor}' },
      { shortcut: '/smgiveaway', expansion: '🎁 GIVEAWAY TIME!\n\nWe\'re giving away {input:Prize}!\n\nTo enter:\n1️⃣ Follow us\n2️⃣ Like this post\n3️⃣ Tag 2 friends\n\nWinner announced {input:Date}! Good luck! 🍀' },
      { shortcut: '/smcta', expansion: '👉 {input:Action} now!\n\n🔗 {input:Link}\n\n{input:Hashtags}' }
    ]
  }
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
    const statusBar = document.getElementById('syncStatusBar');
    const statusIcon = document.getElementById('syncStatusIcon');
    const statusText = document.getElementById('syncStatusText');
    const statusAction = document.getElementById('syncStatusAction');
    
    if (syncBtn) {
      if (isLoggedIn) {
        syncBtn.classList.add('synced');
        syncBtn.textContent = '✓ Synced';
      } else {
        syncBtn.classList.remove('synced');
        syncBtn.textContent = '☁️ Sync';
      }
    }
    
    // Update status bar
    if (statusBar) {
      if (isLoggedIn) {
        statusBar.style.display = 'flex';
        statusBar.classList.remove('error', 'syncing');
        statusBar.classList.add('synced');
        statusIcon.textContent = '✓';
        const user = await CloudSync.getUser();
        const lastSync = await CloudSync.getLastSync();
        const syncTime = lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never';
        statusText.textContent = `Synced as ${user?.email?.split('@')[0] || 'User'} • Last: ${syncTime}`;
        statusAction.textContent = 'Sync Now';
        statusAction.onclick = handleSyncNow;
      } else {
        statusBar.style.display = 'flex';
        statusBar.classList.remove('synced', 'syncing', 'error');
        statusIcon.textContent = '☁️';
        statusText.textContent = 'Not connected • Sign in to sync';
        statusAction.textContent = 'Connect';
        statusAction.onclick = () => showModal('syncModal');
      }
    }
  } catch (e) {
    console.error('Error updating sync button state:', e);
  }
}

// Handle sync now button
async function handleSyncNow() {
  const statusBar = document.getElementById('syncStatusBar');
  const statusIcon = document.getElementById('syncStatusIcon');
  const statusText = document.getElementById('syncStatusText');
  const statusAction = document.getElementById('syncStatusAction');
  
  try {
    statusBar.classList.remove('synced', 'error');
    statusBar.classList.add('syncing');
    statusIcon.textContent = '🔄';
    statusText.textContent = 'Syncing...';
    statusAction.disabled = true;
    
    await CloudSync.syncToCloud(macros);
    
    statusBar.classList.remove('syncing');
    statusBar.classList.add('synced');
    statusIcon.textContent = '✓';
    statusText.textContent = `Synced just now • ${macros.length} macros`;
    statusAction.disabled = false;
    
    showToast('Macros synced successfully!', 'success');
  } catch (error) {
    statusBar.classList.remove('syncing');
    statusBar.classList.add('error');
    statusIcon.textContent = '⚠️';
    statusText.textContent = 'Sync failed • ' + error.message;
    statusAction.disabled = false;
    
    showToast('Sync failed: ' + error.message, 'error');
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
    const result = await chrome.storage.sync.get(['macros', 'folders', 'macroStats', 'counters', 'lightMode', 'hasOnboarded', 'compactMode', 'lastBackup']);
    macros = result.macros || [];
    folders = result.folders || [];
    macroStats = result.macroStats || {};
    counters = result.counters || {};
    lightMode = result.lightMode || false;
    compactMode = result.compactMode || false;
    isFirstRun = !result.hasOnboarded;
    
    applyTheme();
    applyCompactMode();
    updateFolderSelects();
    updateQuickStats();
    renderFavorites();
    renderRecentMacros();
    renderPinnedMacros();
    renderMacros();
    generateHeatmap();
    checkBackupReminder(result.lastBackup);
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

// Compact Mode
function applyCompactMode() {
  document.body.classList.toggle('compact-mode', compactMode);
}

async function toggleCompactMode() {
  compactMode = !compactMode;
  applyCompactMode();
  await chrome.storage.sync.set({ compactMode });
  showToast(compactMode ? 'Compact mode enabled' : 'Normal view', 'success');
}

// Pinned Macros
function renderPinnedMacros() {
  const container = document.getElementById('pinnedMacros');
  const section = document.getElementById('pinnedSection');
  
  if (!container || !section) return;
  
  const pinned = macros.filter(m => m.pinned);
  
  if (pinned.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  container.innerHTML = pinned.map(m => `
    <div class="pinned-macro-chip" data-id="${m.id}">
      <span class="pin-icon">📌</span>
      <span class="shortcut">${escapeHtml(m.shortcut)}</span>
    </div>
  `).join('');
  
  container.querySelectorAll('.pinned-macro-chip').forEach(el => {
    el.addEventListener('click', () => editMacro(el.dataset.id));
  });
}

// Backup Reminder
function checkBackupReminder(lastBackup) {
  const reminderEl = document.getElementById('backupReminder');
  if (!reminderEl) return;
  
  // Show reminder if no backup in 7 days and has more than 5 macros
  const daysSinceBackup = lastBackup ? Math.floor((Date.now() - lastBackup) / (1000 * 60 * 60 * 24)) : 999;
  
  if (daysSinceBackup >= 7 && macros.length >= 5) {
    reminderEl.style.display = 'flex';
    reminderEl.querySelector('.backup-reminder-text span').textContent = 
      lastBackup ? `Last backup: ${daysSinceBackup} days ago` : 'You\'ve never backed up your macros';
  } else {
    reminderEl.style.display = 'none';
  }
}

async function dismissBackupReminder() {
  const reminderEl = document.getElementById('backupReminder');
  if (reminderEl) reminderEl.style.display = 'none';
  // Snooze for 3 days
  await chrome.storage.sync.set({ lastBackup: Date.now() - (4 * 24 * 60 * 60 * 1000) });
}

async function performBackup() {
  await exportMacros();
  await chrome.storage.sync.set({ lastBackup: Date.now() });
  const reminderEl = document.getElementById('backupReminder');
  if (reminderEl) reminderEl.style.display = 'none';
  showToast('Backup created! 💾', 'success');
}

// Duplicate Detection
function checkDuplicateShortcut(shortcut, excludeId = null) {
  const normalizedShortcut = shortcut.toLowerCase().trim();
  const duplicates = macros.filter(m => 
    m.id !== excludeId && 
    (m.shortcut.toLowerCase() === normalizedShortcut ||
     (m.aliases || []).some(a => a.toLowerCase() === normalizedShortcut))
  );
  return duplicates;
}

function showDuplicateWarning(duplicates) {
  const warningEl = document.getElementById('duplicateWarning');
  if (!warningEl) return;
  
  if (duplicates.length > 0) {
    warningEl.style.display = 'flex';
    warningEl.innerHTML = `
      <span class="duplicate-warning-icon">⚠️</span>
      <span><strong>Duplicate found!</strong> This shortcut is already used by "${escapeHtml(duplicates[0].shortcut)}"</span>
    `;
  } else {
    warningEl.style.display = 'none';
  }
}

// Enhanced Usage Insights
function renderUsageInsights() {
  const panel = document.getElementById('usageInsightsPanel');
  if (!panel) return;
  
  // Calculate stats
  let totalExpansions = 0;
  let totalCharsSaved = 0;
  let uniqueDays = new Set();
  
  Object.entries(macroStats).forEach(([id, s]) => {
    totalExpansions += s.count || 0;
    if (s.lastUsed) {
      uniqueDays.add(new Date(s.lastUsed).toDateString());
    }
  });
  
  macros.forEach(m => {
    const stat = macroStats[m.id] || { count: 0 };
    totalCharsSaved += Math.max(0, (m.expansion.length - m.shortcut.length) * stat.count);
  });
  
  // Top macros
  const topMacros = macros
    .filter(m => macroStats[m.id]?.count > 0)
    .sort((a, b) => (macroStats[b.id]?.count || 0) - (macroStats[a.id]?.count || 0))
    .slice(0, 5);
  
  const avgPerDay = uniqueDays.size > 0 ? Math.round(totalExpansions / uniqueDays.size) : 0;
  const timeSaved = Math.round(totalCharsSaved / 200); // ~200 chars per minute
  
  panel.innerHTML = `
    <div class="insights-header">
      <h3>📊 Usage Insights</h3>
      ${uniqueDays.size >= 3 ? '<span class="streak-badge">🔥 Active User</span>' : ''}
    </div>
    <div class="insights-grid">
      <div class="insight-card">
        <div class="insight-value">${totalExpansions.toLocaleString()}</div>
        <div class="insight-label">Total Expansions</div>
      </div>
      <div class="insight-card">
        <div class="insight-value">${timeSaved >= 60 ? Math.round(timeSaved/60) + 'h' : timeSaved + 'm'}</div>
        <div class="insight-label">Time Saved</div>
      </div>
      <div class="insight-card">
        <div class="insight-value">${avgPerDay}</div>
        <div class="insight-label">Avg/Day</div>
      </div>
      <div class="insight-card">
        <div class="insight-value">${totalCharsSaved.toLocaleString()}</div>
        <div class="insight-label">Chars Saved</div>
      </div>
    </div>
    ${topMacros.length > 0 ? `
      <div class="top-macros-list">
        <div class="top-macros-header">🏆 Top Macros</div>
        ${topMacros.map((m, i) => `
          <div class="top-macro-item">
            <span class="top-macro-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</span>
            <span class="top-macro-shortcut">${escapeHtml(m.shortcut)}</span>
            <span class="top-macro-count">${macroStats[m.id]?.count || 0} uses</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
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

// Detect macro type from expansion content
function detectMacroType(expansion) {
  if (expansion.includes('{js:')) return { type: 'js', label: 'JS', icon: '💻' };
  if (expansion.includes('{input:')) return { type: 'input', label: 'INPUT', icon: '📝' };
  if (expansion.includes('{date') || expansion.includes('{time}') || expansion.includes('{datetime}')) return { type: 'date', label: 'DATE', icon: '📅' };
  if (expansion.includes('{counter:')) return { type: 'counter', label: 'COUNT', icon: '🔢' };
  if (expansion.includes('{random:')) return { type: 'random', label: 'RAND', icon: '🎲' };
  if (expansion.includes('{clipboard}')) return { type: 'clipboard', label: 'CLIP', icon: '📋' };
  return { type: 'text', label: 'TEXT', icon: '📄' };
}

// Render single macro item
function renderMacroItem(macro, filter = '') {
  const stats = macroStats[macro.id] || { count: 0 };
  const isSelected = selectedMacros.has(macro.id);
  const isEnabled = macro.enabled !== false;
  const isFavorite = macro.favorited;
  const isPinned = macro.pinned;
  
  const shortcutDisplay = filter ? highlight(macro.shortcut, filter) : escapeHtml(macro.shortcut);
  const preview = macro.expansion.substring(0, 80) + (macro.expansion.length > 80 ? '...' : '');
  
  // Detect type for color-coding
  const typeInfo = macro.isRegex ? { type: 'regex', label: 'REGEX', icon: '🎯' } : detectMacroType(macro.expansion);
  
  const indicators = [];
  if (macro.aliases?.length) indicators.push('<span class="indicator alias" title="Has aliases">🔗</span>');
  if (macro.conditions && Object.keys(macro.conditions).length) indicators.push('<span class="indicator condition" title="Conditional">⚡</span>');
  if (macro.domains?.length) indicators.push('<span class="indicator domain" title="Domain filter">🌐</span>');
  if (macro.isRegex) indicators.push('<span class="indicator regex" title="Regex pattern">🎯</span>');
  if (macro.expansion.includes('{js:')) indicators.push('<span class="indicator js" title="JavaScript">💻</span>');
  
  return `
    <div class="macro-item ${isSelected ? 'selected' : ''} ${!isEnabled ? 'disabled' : ''} ${isFavorite ? 'favorited' : ''} ${isPinned ? 'pinned' : ''}" 
         data-id="${macro.id}" data-expansion="${escapeHtml(macro.expansion)}" draggable="true">
      <div class="macro-header">
        <div class="macro-header-left">
          <input type="checkbox" class="macro-checkbox" ${isSelected ? 'checked' : ''} data-id="${macro.id}">
          <span class="drag-handle">⠿</span>
          <div class="macro-shortcut shortcut-type-${typeInfo.type}">
            ${shortcutDisplay}
            <span class="type-indicator ${typeInfo.type}">${typeInfo.icon} ${typeInfo.label}</span>
            <div class="macro-indicators">${indicators.join('')}</div>
          </div>
        </div>
        <div class="macro-header-right">
          ${stats.count > 0 ? `<span class="usage-badge">⚡${stats.count}</span>` : ''}
          <button class="pin-btn ${isPinned ? 'active' : ''}" data-id="${macro.id}" title="Pin to top">
            ${isPinned ? '📌' : '📍'}
          </button>
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
          e.target.classList.contains('pin-btn') ||
          e.target.classList.contains('drag-handle')) return;
      editMacro(el.dataset.id);
    });
    
    el.addEventListener('dblclick', e => {
      // Quick inline edit could go here
    });
    
    // Hover preview tooltip
    el.addEventListener('mouseenter', e => {
      hoverTimeout = setTimeout(() => showMacroTooltip(el, e), 500);
    });
    
    el.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      hideMacroTooltip();
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
  
  // Pin buttons
  document.querySelectorAll('.pin-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const macro = macros.find(m => m.id === btn.dataset.id);
      if (macro) {
        macro.pinned = !macro.pinned;
        await saveMacros();
        renderPinnedMacros();
        showToast(macro.pinned ? 'Pinned to top 📌' : 'Unpinned', 'success');
      }
    });
  });
}

// Show macro preview tooltip on hover
function showMacroTooltip(element, event) {
  const macroId = element.dataset.id;
  const macro = macros.find(m => m.id === macroId);
  if (!macro) return;
  
  hideMacroTooltip();
  
  const stats = macroStats[macroId] || { count: 0 };
  const typeInfo = macro.isRegex ? { type: 'regex', label: 'REGEX' } : detectMacroType(macro.expansion);
  
  const tooltip = document.createElement('div');
  tooltip.className = 'macro-preview-tooltip';
  tooltip.innerHTML = `
    <div class="tooltip-header">
      <span class="tooltip-shortcut">${escapeHtml(macro.shortcut)}</span>
      <span class="tooltip-type-badge type-indicator ${typeInfo.type}">${typeInfo.label}</span>
    </div>
    <div class="tooltip-expansion">${escapeHtml(macro.expansion)}</div>
    <div class="tooltip-stats">
      <span>⚡ ${stats.count} uses</span>
      ${stats.lastUsed ? `<span>🕐 ${formatRelativeTime(stats.lastUsed)}</span>` : ''}
    </div>
  `;
  
  document.body.appendChild(tooltip);
  
  // Position tooltip
  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let left = rect.right + 10;
  let top = rect.top;
  
  // Adjust if would go off screen
  if (left + tooltipRect.width > window.innerWidth) {
    left = rect.left - tooltipRect.width - 10;
  }
  if (top + tooltipRect.height > window.innerHeight) {
    top = window.innerHeight - tooltipRect.height - 10;
  }
  
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  
  currentTooltip = tooltip;
}

function hideMacroTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

function formatRelativeTime(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
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
          <span>📝 ${p.macros.length} macros</span>
          <span>👤 ${p.author}</span>
        </div>
      </div>
      <div class="package-actions" style="display: flex; gap: 6px; margin-top: 8px;">
        <button class="btn btn-sm btn-primary install-package-btn" data-index="${i}" style="flex: 1;">
          ⬇️ Install
        </button>
        <button class="btn btn-sm btn-secondary download-package-btn" data-index="${i}" title="Download as JSON">
          💾
        </button>
      </div>
    </div>
  `).join('');
  
  grid.querySelectorAll('.install-package-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      await installPackage(index);
    });
  });
  
  grid.querySelectorAll('.download-package-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      downloadPackage(index);
    });
  });
  
  grid.querySelectorAll('.package-card').forEach(card => {
    card.addEventListener('click', () => {
      const index = parseInt(card.dataset.index);
      previewPackage(index);
    });
  });
  
  showModal('packagesModal');
}

function previewPackage(index) {
  const pkg = PACKAGES[index];
  const previewHtml = `
    <div style="padding: 16px;">
      <h3 style="margin-bottom: 12px;">${pkg.icon} ${pkg.name}</h3>
      <p style="color: var(--text-secondary); margin-bottom: 16px;">${pkg.desc}</p>
      <div style="max-height: 250px; overflow-y: auto;">
        ${pkg.macros.map(m => `
          <div style="background: var(--bg-secondary); padding: 10px 12px; border-radius: 8px; margin-bottom: 8px;">
            <code style="color: var(--primary); font-weight: 600;">${escapeHtml(m.shortcut)}</code>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHtml(m.expansion.substring(0, 60))}${m.expansion.length > 60 ? '...' : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button class="btn btn-primary" style="flex: 1;" onclick="installPackage(${index}); document.getElementById('packagePreviewModal')?.remove();">
          ⬇️ Install
        </button>
        <button class="btn btn-secondary" style="flex: 1;" onclick="downloadPackage(${index});">
          💾 Download
        </button>
      </div>
    </div>
  `;
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'packagePreviewModal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header">
        <h2>Package Preview</h2>
        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        ${previewHtml}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function downloadPackage(index) {
  const pkg = PACKAGES[index];
  
  // Format macros for export
  const exportData = {
    name: pkg.name,
    description: pkg.desc,
    author: pkg.author,
    icon: pkg.icon,
    exportedAt: new Date().toISOString(),
    macros: pkg.macros.map(m => ({
      shortcut: m.shortcut,
      expansion: m.expansion,
      folder: pkg.name,
      aliases: [],
      createdAt: new Date().toISOString()
    }))
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fountain-package-${pkg.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast(`📦 Downloaded ${pkg.name} package!`, 'success');
}

async function installPackage(index) {
  const pkg = PACKAGES[index];
  let installed = 0;
  let skipped = 0;
  
  // Create folder for package if it doesn't exist
  let folderId = folders.find(f => f.name === pkg.name)?.id;
  if (!folderId) {
    folderId = Date.now().toString();
    folders.push({ id: folderId, name: pkg.name, icon: pkg.icon });
    await saveFolders();
  }
  
  for (const m of pkg.macros) {
    // Check if shortcut already exists
    const exists = macros.some(existing => existing.shortcut === m.shortcut);
    if (exists) {
      skipped++;
      continue;
    }
    
    macros.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      shortcut: m.shortcut,
      expansion: m.expansion,
      folder: folderId,
      aliases: [],
      createdAt: Date.now(),
      usageCount: 0
    });
    installed++;
  }
  
  await saveMacros();
  renderMacros();
  updateFolderOptions();
  
  // Remove preview modal if exists
  document.getElementById('packagePreviewModal')?.remove();
  
  if (installed > 0) {
    showToast(`✅ Installed ${installed} macros from ${pkg.name}!${skipped > 0 ? ` (${skipped} skipped - already exist)` : ''}`, 'success');
  } else {
    showToast(`All macros from ${pkg.name} already installed!`, 'info');
  }
}

// Dashboard
function openDashboard() {
  updateDashboard();
  generateHeatmap();
  showModal('dashboardModal');
}

function openSharedMacros() {
  showModal('sharedModal');
  loadSharedMacros();
}

async function loadSharedMacros() {
  const listEl = document.getElementById('sharedMacrosList');
  const emptyEl = document.getElementById('sharedEmpty');
  
  listEl.innerHTML = `
    <div class="shared-loading" style="text-align: center; padding: 40px; color: var(--text-secondary);">
      <div style="font-size: 32px; margin-bottom: 8px;">🔄</div>
      <p>Loading shared macros...</p>
    </div>
  `;
  
  try {
    const response = await fetch('https://fountain-macro-assistant.vercel.app/api/shared-macros/list');
    const result = await response.json();
    
    if (result.success && result.macros && result.macros.length > 0) {
      window.sharedMacrosData = result.macros;
      renderSharedMacros(result.macros);
      emptyEl.style.display = 'none';
    } else {
      // Show sample macros if API returns empty
      const sampleMacros = getSampleSharedMacros();
      window.sharedMacrosData = sampleMacros;
      renderSharedMacros(sampleMacros);
      emptyEl.style.display = 'none';
    }
  } catch (e) {
    console.error('Error loading shared macros:', e);
    // Show sample macros on error
    const sampleMacros = getSampleSharedMacros();
    window.sharedMacrosData = sampleMacros;
    renderSharedMacros(sampleMacros);
    emptyEl.style.display = 'none';
  }
}

function getSampleSharedMacros() {
  return [
    {
      id: 'sig-pro',
      shortcut: '/sig',
      expansion: 'Best regards,\\n{input:Your Name}\\n{input:Title} | {input:Company}\\n📧 {input:Email}',
      description: 'Professional email signature with dynamic fields',
      category: 'professional',
      author: 'Fountain Team',
      downloads: 1250
    },
    {
      id: 'date-today',
      shortcut: '/today',
      expansion: '{date:MMMM D, YYYY}',
      description: 'Insert today\'s date in a nice format',
      category: 'personal',
      author: 'Fountain Team',
      downloads: 890
    },
    {
      id: 'email-followup',
      shortcut: '/followup',
      expansion: 'Hi {input:Name},\\n\\nJust following up on my previous email. Please let me know if you have any questions.\\n\\nBest regards',
      description: 'Quick follow-up email template',
      category: 'professional',
      author: 'Fountain Team',
      downloads: 756
    },
    {
      id: 'code-console',
      shortcut: '/clog',
      expansion: 'console.log(\'{cursor}\');',
      description: 'Quick console.log with cursor placement',
      category: 'developer',
      author: 'Fountain Team',
      downloads: 2100
    },
    {
      id: 'meeting-notes',
      shortcut: '/meeting',
      expansion: '## Meeting Notes - {date:MMM D}\\n\\n**Attendees:** {input:Attendees}\\n**Topic:** {input:Topic}\\n\\n### Discussion\\n{cursor}\\n\\n### Action Items\\n- ',
      description: 'Meeting notes template with date',
      category: 'professional',
      author: 'Fountain Team',
      downloads: 543
    },
    {
      id: 'thank-you',
      shortcut: '/thanks',
      expansion: 'Thank you so much for {input:reason}! I really appreciate it.',
      description: 'Quick thank you message',
      category: 'personal',
      author: 'Fountain Team',
      downloads: 421
    }
  ];
}

function renderSharedMacros(macrosList, filter = 'all', search = '') {
  const listEl = document.getElementById('sharedMacrosList');
  
  let filtered = macrosList;
  
  if (filter !== 'all') {
    filtered = filtered.filter(m => m.category === filter);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(m => 
      m.shortcut.toLowerCase().includes(searchLower) ||
      m.description?.toLowerCase().includes(searchLower) ||
      m.expansion.toLowerCase().includes(searchLower)
    );
  }
  
  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
        <p>No macros found</p>
      </div>
    `;
    return;
  }
  
  listEl.innerHTML = filtered.map(macro => `
    <div class="shared-macro-item" style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; border: 1px solid var(--border);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div>
          <code style="background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${escapeHtml(macro.shortcut)}</code>
          <span style="font-size: 11px; color: var(--text-secondary); margin-left: 8px;">${macro.downloads || 0} imports</span>
        </div>
        <button class="btn btn-sm btn-primary import-shared-btn" data-id="${macro.id}" style="padding: 6px 12px; font-size: 12px;">
          ⬇️ Import
        </button>
      </div>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">${escapeHtml(macro.description || '')}</p>
      <div style="background: var(--bg); padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 12px; color: var(--text); white-space: pre-wrap; max-height: 60px; overflow: hidden;">${escapeHtml(macro.expansion.replace(/\\n/g, '\n'))}</div>
    </div>
  `).join('');
  
  // Add click handlers for import buttons
  listEl.querySelectorAll('.import-shared-btn').forEach(btn => {
    btn.addEventListener('click', () => importSharedMacro(btn.dataset.id));
  });
}

async function importSharedMacro(macroId) {
  const macro = window.sharedMacrosData?.find(m => m.id === macroId);
  if (!macro) return;
  
  // Check if shortcut already exists
  const exists = macros.some(m => m.shortcut === macro.shortcut);
  if (exists) {
    if (!confirm(`A macro with shortcut "${macro.shortcut}" already exists. Import anyway with a modified shortcut?`)) {
      return;
    }
    macro.shortcut = macro.shortcut + '_imported';
  }
  
  // Create new macro from shared
  const newMacro = {
    id: Date.now().toString(),
    shortcut: macro.shortcut,
    expansion: macro.expansion.replace(/\\n/g, '\n'),
    description: macro.description || '',
    folder: '',
    aliases: [],
    createdAt: Date.now(),
    usageCount: 0
  };
  
  macros.push(newMacro);
  await saveMacros();
  renderMacros();
  
  showToast(`Imported "${macro.shortcut}" successfully! 🎉`, 'success');
  
  // Update button to show imported
  const btn = document.querySelector(`.import-shared-btn[data-id="${macroId}"]`);
  if (btn) {
    btn.textContent = '✓ Imported';
    btn.disabled = true;
    btn.style.opacity = '0.6';
  }
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
  document.getElementById('compactToggle')?.addEventListener('click', toggleCompactMode);
  
  // Backup reminder
  document.getElementById('backupNowBtn')?.addEventListener('click', performBackup);
  document.getElementById('dismissBackupBtn')?.addEventListener('click', dismissBackupReminder);
  
  // Duplicate detection on shortcut input
  document.getElementById('shortcutInput')?.addEventListener('input', e => {
    const duplicates = checkDuplicateShortcut(e.target.value, currentEditingId);
    showDuplicateWarning(duplicates);
  });
  
  // Main buttons
  document.getElementById('addMacroBtn')?.addEventListener('click', openAddMacro);
  document.getElementById('emptyAddBtn')?.addEventListener('click', openAddMacro);
  document.getElementById('addFolderBtn')?.addEventListener('click', openAddFolder);
  document.getElementById('helpBtn')?.addEventListener('click', () => showModal('helpModal'));
  document.getElementById('templatesBtn')?.addEventListener('click', openTemplates);
  document.getElementById('packagesBtn')?.addEventListener('click', openPackages);
  document.getElementById('dashboardBtn')?.addEventListener('click', openDashboard);
  document.getElementById('sharedBtn')?.addEventListener('click', openSharedMacros);
  
  // Shared Macros Modal
  document.getElementById('closeSharedModal')?.addEventListener('click', () => closeModal('sharedModal'));
  document.getElementById('closeSharedBtn')?.addEventListener('click', () => closeModal('sharedModal'));
  document.getElementById('sharedSearchInput')?.addEventListener('input', (e) => {
    const search = e.target.value;
    const activeCategory = document.querySelector('.shared-category.active')?.dataset.category || 'all';
    renderSharedMacros(window.sharedMacrosData || [], activeCategory, search);
  });
  document.querySelectorAll('.shared-category').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shared-category').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'var(--bg-secondary)';
        b.style.color = 'inherit';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--primary)';
      btn.style.color = 'white';
      const search = document.getElementById('sharedSearchInput')?.value || '';
      renderSharedMacros(window.sharedMacrosData || [], btn.dataset.category, search);
    });
  });
  
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
  document.getElementById('googleSignInBtn')?.addEventListener('click', handleGoogleSignIn);
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

// Google Sign In Handler
async function handleGoogleSignIn() {
  const btn = document.getElementById('googleSignInBtn');
  if (!btn) return;
  
  btn.disabled = true;
  btn.innerHTML = `
    <svg class="spinning" width="18" height="18" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="30 70"/>
    </svg>
    Signing in...
  `;
  
  try {
    // Check if GoogleAuth is available (Chrome extension environment)
    if (typeof GoogleAuth !== 'undefined') {
      const result = await GoogleAuth.signIn();
      
      if (result.success) {
        showToast(`Welcome, ${result.user.name}! ☁️`, 'success');
        await updateSyncUIForGoogle();
        closeModal('syncModal');
        
        // Sync macros to cloud
        const syncResult = await GoogleAuth.syncToCloud(macros);
        if (syncResult.success) {
          showToast('Macros synced to cloud!', 'success');
        }
        
        // Update status bar
        updateSyncButtonState();
      } else {
        showSyncError(result.error || 'Google sign-in failed');
      }
    } else {
      showSyncError('Google sign-in is only available in the Chrome extension');
    }
  } catch (error) {
    showSyncError(error.message || 'Sign-in failed');
  }
  
  btn.disabled = false;
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Sign in with Google
  `;
}

// Update UI for Google-authenticated users
async function updateSyncUIForGoogle() {
  let isLoggedIn = false;
  let user = null;
  
  // Check Google auth first, then fall back to email auth
  if (typeof GoogleAuth !== 'undefined') {
    isLoggedIn = await GoogleAuth.isSignedIn();
    if (isLoggedIn) {
      user = await GoogleAuth.getUser();
    }
  }
  
  if (!isLoggedIn && typeof CloudSync !== 'undefined') {
    isLoggedIn = await CloudSync.isLoggedIn();
    if (isLoggedIn) {
      user = await CloudSync.getUser();
    }
  }
  
  document.getElementById('syncAuthForm').style.display = isLoggedIn ? 'none' : 'block';
  document.getElementById('syncStatus').style.display = isLoggedIn ? 'block' : 'none';
  
  if (isLoggedIn && user) {
    document.getElementById('syncUserName').textContent = user.name || user.displayName || 'User';
    document.getElementById('syncUserEmail').textContent = user.email || '';
    
    // Show user picture if available (Google)
    const avatarEl = document.querySelector('.sync-avatar');
    if (avatarEl && user.picture) {
      avatarEl.innerHTML = `<img src="${user.picture}" alt="${user.name}">`;
    } else if (avatarEl) {
      avatarEl.innerHTML = '👤';
    }
    
    const lastSync = typeof GoogleAuth !== 'undefined' ? 
      await GoogleAuth.getLastSync() : 
      await CloudSync.getLastSync();
    
    document.getElementById('lastSyncTime').textContent = lastSync ? 
      new Date(lastSync).toLocaleString() : 'Never';
    document.getElementById('syncedMacroCount').textContent = macros.length;
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

// Macro Templates Library
// Pre-built templates for common use cases

const macroTemplates = {
  email: {
    name: 'Email Address',
    shortcut: '/email',
    expansion: 'your.email@example.com',
    description: 'Your email address',
    category: 'contact'
  },
  phone: {
    name: 'Phone Number',
    shortcut: '/phone',
    expansion: '(555) 123-4567',
    description: 'Your phone number',
    category: 'contact'
  },
  signature: {
    name: 'Email Signature',
    shortcut: '/sig',
    expansion: `Best regards,
{name}
{title}
{company}
Email: {email}
Phone: {phone}`,
    description: 'Professional email signature',
    category: 'professional'
  },
  address: {
    name: 'Address',
    shortcut: '/addr',
    expansion: `123 Main Street
City, State ZIP Code
Country`,
    description: 'Your full address',
    category: 'contact'
  },
  date: {
    name: 'Current Date',
    shortcut: '/date',
    expansion: '{date}',
    description: 'Insert current date',
    category: 'date-time'
  },
  datetime: {
    name: 'Date & Time',
    shortcut: '/datetime',
    expansion: '{datetime}',
    description: 'Insert current date and time',
    category: 'date-time'
  },
  meeting: {
    name: 'Meeting Template',
    shortcut: '/meeting',
    expansion: `Meeting: {title}
Date: {date}
Time: {time}
Location: {location}
Attendees: {attendees}`,
    description: 'Meeting information template',
    category: 'professional'
  },
  todo: {
    name: 'Todo Item',
    shortcut: '/todo',
    expansion: '- [ ] {task}',
    description: 'Create a todo item',
    category: 'productivity'
  },
  codeBlock: {
    name: 'Code Block',
    shortcut: '/code',
    expansion: '```\n{code}\n```',
    description: 'Code block template',
    category: 'development'
  },
  link: {
    name: 'Link Format',
    shortcut: '/link',
    expansion: '[{text}]({url})',
    description: 'Markdown link format',
    category: 'formatting'
  }
};

// Get template by key
function getTemplate(key) {
  return macroTemplates[key];
}

// Get all templates
function getAllTemplates() {
  return Object.values(macroTemplates);
}

// Get templates by category
function getTemplatesByCategory(category) {
  return Object.values(macroTemplates).filter(t => t.category === category);
}

// Get categories
function getCategories() {
  return [...new Set(Object.values(macroTemplates).map(t => t.category))];
}

// Create macro from template
function createMacroFromTemplate(templateKey, customizations = {}) {
  const template = macroTemplates[templateKey];
  if (!template) return null;
  
  return {
    id: Date.now().toString(),
    shortcut: customizations.shortcut || template.shortcut,
    expansion: customizations.expansion || template.expansion,
    tags: [template.category, ...(customizations.tags || [])],
    folderId: customizations.folderId || null,
    caseSensitive: customizations.caseSensitive || false,
    aliases: customizations.aliases || [],
    conditions: customizations.conditions || null,
    createdAt: new Date().toISOString()
  };
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.MacroTemplates = {
    templates: macroTemplates,
    getTemplate,
    getAllTemplates,
    getTemplatesByCategory,
    getCategories,
    createMacroFromTemplate
  };
}






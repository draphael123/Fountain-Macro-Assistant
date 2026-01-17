# Update GitHub Link After Creating Repository

After you create your GitHub repository for the extension, update the link in `vercel-landing/index.html`.

## Current Link (Placeholder)
The website currently points to:
```
https://github.com/draphael123/Fountain-Macro-Assistant
```

## To Update

1. Find this section in `vercel-landing/index.html` (around line 304):
```html
<a href="https://github.com/draphael123/Fountain-Macro-Assistant" class="btn btn-secondary btn-large" target="_blank" rel="noopener">
```

2. Replace with your actual GitHub repository URL:
```html
<a href="https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension" class="btn btn-secondary btn-large" target="_blank" rel="noopener">
```

3. Also update the installation guide link (around line 320):
```html
<a href="https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension" target="_blank" rel="noopener">GitHub repository</a>
```

4. Update the git clone command in the instructions:
```html
<code>git clone https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension.git</code>
```

5. Deploy the updated website to Vercel

## Recommended Repository Name
- `fountain-macro-assistant-extension` (matches the folder name)









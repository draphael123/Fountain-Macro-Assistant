# Privacy Policy Hosting Instructions

Your privacy policy HTML file (`privacy-policy.html`) needs to be hosted online and publicly accessible. Here are several options:

## Option 1: GitHub Pages (Recommended - Free & Easy)

### Steps:

1. **Create a GitHub Repository** (if you don't have one):
   - Go to https://github.com/new
   - Create a new repository (e.g., `fountain-macro-assistant`)
   - Make it public or private (both work for Pages)

2. **Upload the Privacy Policy**:
   - Upload `privacy-policy.html` to your repository
   - You can rename it to `index.html` if you want a cleaner URL

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages** (in left sidebar)
   - Under "Source", select **Deploy from a branch**
   - Choose **main** (or master) branch
   - Select **/ (root)** folder
   - Click **Save**

4. **Get Your URL**:
   - Your privacy policy will be available at:
     - `https://[your-username].github.io/[repository-name]/privacy-policy.html`
     - Or if renamed to `index.html`: `https://[your-username].github.io/[repository-name]/`

5. **Test the URL**:
   - Open the URL in a browser
   - Make sure it loads correctly
   - Copy this URL for your Chrome Web Store submission

### Example URLs:
- `https://yourusername.github.io/fountain-macro-assistant/privacy-policy.html`
- `https://yourusername.github.io/fountain-macro-assistant/` (if using index.html)

---

## Option 2: Host on Your Website (Vercel)

If your website is already on Vercel, you can add the privacy policy there:

### Steps:

1. **Add to Vercel Landing**:
   - Copy `privacy-policy.html` to the `vercel-landing` folder
   - Commit and push to your repository
   - Vercel will automatically deploy it

2. **Get Your URL**:
   - Your privacy policy will be at:
     - `https://fountain-macro-assistant.vercel.app/privacy-policy.html`

3. **Test the URL**:
   - Visit the URL to confirm it works
   - Use this URL for Chrome Web Store submission

---

## Option 3: Netlify Drop (Free & Instant)

### Steps:

1. **Go to Netlify Drop**:
   - Visit https://app.netlify.com/drop

2. **Drag and Drop**:
   - Drag your `privacy-policy.html` file (or a folder containing it)
   - Netlify will instantly deploy it

3. **Get Your URL**:
   - You'll get a URL like: `https://random-name-123.netlify.app/privacy-policy.html`
   - You can rename the site in Netlify settings

---

## Option 4: Other Free Hosting Options

### GitLab Pages
- Similar to GitHub Pages
- Upload to GitLab repository
- Enable Pages in settings

### Surge.sh
- Install: `npm install -g surge`
- Run: `surge` in folder with privacy-policy.html
- Get instant URL

### Firebase Hosting
- Free tier available
- Requires Firebase account setup

---

## Important Requirements

✅ **Must be publicly accessible** - Anyone should be able to view it  
✅ **Must return HTTP 200** - No 404 errors  
✅ **Must be HTTPS** - Secure connection required  
✅ **Must be stable** - URL should not change frequently  

---

## Testing Your Privacy Policy URL

Before submitting to Chrome Web Store:

1. **Open in Incognito/Private Window**:
   - Test that it loads without login
   - Verify it's truly public

2. **Check HTTP Status**:
   - Use https://httpstatus.io/ to verify it returns 200

3. **Test on Mobile**:
   - Make sure it's mobile-friendly

4. **Verify Content**:
   - Ensure all text is readable
   - Check formatting looks good

---

## Quick Checklist

- [ ] Privacy policy HTML file created (`privacy-policy.html`)
- [ ] Privacy policy uploaded to hosting service
- [ ] Privacy policy URL is publicly accessible
- [ ] Privacy policy URL returns HTTP 200
- [ ] Privacy policy URL uses HTTPS
- [ ] Privacy policy URL tested in incognito window
- [ ] Privacy policy URL copied for Chrome Web Store submission

---

## Recommended Approach

**For fastest setup**: Use **GitHub Pages** (Option 1)
- Free
- Reliable
- Easy to update
- Professional URL
- No credit card required

**If you already have Vercel**: Use **Option 2**
- Keep everything in one place
- Same domain
- Easy to manage

---

## Need Help?

If you encounter issues:
1. Make sure the file is named correctly
2. Verify the file is in the root directory (or adjust path)
3. Check that Pages/hosting is enabled
4. Wait a few minutes after enabling (propagation time)
5. Clear browser cache and try again

Good luck! 🚀











# Website Deployment Instructions

## Making the Website Public

The website is configured for deployment on Vercel. Here's how to make it public:

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Navigate to the website directory**:
   ```bash
   cd vercel-landing
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   - Follow the prompts to create a new project
   - The site will be live at: `https://your-project-name.vercel.app`

4. **For production deployment**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Set the root directory to `vercel-landing`
6. Click "Deploy"

### Option 3: Deploy via GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push to main/master

### Custom Domain

1. In Vercel dashboard, go to your project
2. Navigate to "Settings" → "Domains"
3. Add your custom domain (e.g., fountain.net)
4. Follow DNS configuration instructions

### Files Ready for Deployment

- ✅ `vercel.json` - Deployment configuration
- ✅ `index.html` - Main page
- ✅ `styles.css` - All styles
- ✅ `script.js` - All scripts
- ✅ All assets and images

The website is ready to deploy and will be public once deployed to Vercel!










# Fix: Google Client ID Not Configured Error

## Error Message
```
Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.
```

## Solution

### Step 1: Create a `.env` file

In the root directory of your **Itemized Receipts Generator** project, create a file named `.env` (no extension).

**Location**: Should be in the same folder as your `package.json` or `vite.config.js`

### Step 2: Get a Google Client ID

You need to create a Google Cloud project and get a Client ID:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click "Select a project" → "New Project"
   - Give it a name (e.g., "Itemized Receipts Generator")
   - Click "Create"

3. **Enable Google Vision API**
   - In the search bar, type "Vision API"
   - Click on "Cloud Vision API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: External (or Internal if using Google Workspace)
     - App name: "Itemized Receipts Generator"
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
     - Scopes: Click "Save and Continue"
     - Test users: Add your email, click "Save and Continue"
     - Click "Back to Dashboard"

5. **Create OAuth Client ID**
   - Application type: "Web application"
   - Name: "Itemized Receipts Generator Web Client"
   - Authorized JavaScript origins:
     - For local development: `http://localhost:5173` (or your Vite port)
     - For production: Your production URL
   - Authorized redirect URIs:
     - For local: `http://localhost:5173` (or your Vite port)
     - For production: Your production URL
   - Click "Create"

6. **Copy the Client ID**
   - You'll see a popup with your Client ID
   - Copy the Client ID (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

### Step 3: Add to `.env` file

Create or edit the `.env` file in your project root:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

**Replace `your-client-id-here.apps.googleusercontent.com` with your actual Client ID**

### Step 4: Restart Your Development Server

After creating/updating the `.env` file:

1. Stop your dev server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

### Step 5: Verify It Works

The error should disappear and your app should work correctly.

---

## Important Notes

### ⚠️ Security

1. **Never commit `.env` to Git**
   - Add `.env` to your `.gitignore` file
   - Create a `.env.example` file with placeholder:
     ```env
     VITE_GOOGLE_CLIENT_ID=your-client-id-here
     ```

2. **For Production**
   - Set environment variables in your hosting platform (Vercel, Netlify, etc.)
   - Don't hardcode credentials in your code

### 📝 Example `.env` file

```env
# Google Client ID for Vision API
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

### 📝 Example `.gitignore` entry

Make sure `.env` is in your `.gitignore`:

```
.env
.env.local
.env.production
```

---

## Troubleshooting

### Error persists after adding `.env`
- Make sure the file is named exactly `.env` (not `.env.txt`)
- Restart your dev server
- Check that the Client ID is correct (no extra spaces)
- Verify the file is in the project root (same level as `package.json`)

### "Invalid Client ID" error
- Check that you copied the full Client ID
- Verify the Client ID is for a "Web application" type
- Make sure authorized origins include your localhost URL

### API not working
- Ensure "Cloud Vision API" is enabled in Google Cloud Console
- Check that billing is enabled (Vision API requires billing)
- Verify your API key has proper permissions

---

## Quick Checklist

- [ ] Created `.env` file in project root
- [ ] Got Google Client ID from Google Cloud Console
- [ ] Added `VITE_GOOGLE_CLIENT_ID=...` to `.env`
- [ ] Enabled Cloud Vision API
- [ ] Configured OAuth consent screen
- [ ] Added `.env` to `.gitignore`
- [ ] Restarted dev server
- [ ] Error is gone!

---

## Need More Help?

- **Google Cloud Console**: https://console.cloud.google.com/
- **Vision API Docs**: https://cloud.google.com/vision/docs
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html

Good luck! 🚀











# Netlify Deployment Guide

## Prerequisites

1. **Fix Node Modules Permissions** (if needed):
   ```bash
   cd frontend
   sudo rm -rf node_modules package-lock.json
   npm install
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Test Build Locally**:
   ```bash
   npm run build
   ```

## Netlify Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Push to GitHub/GitLab/Bitbucket**:
   - Commit and push all changes to your repository
   - Make sure `netlify.toml` and updated `package.json` are included

2. **Connect to Netlify**:
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider and select your repository

3. **Configure Build Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build` (auto-detected from netlify.toml)
   - **Publish directory**: Leave empty (handled by plugin)
   - **Node version**: 18 (or higher)

4. **Environment Variables** (if needed):
   - Go to Site settings → Environment variables
   - Add `NEXT_PUBLIC_API_URL` if your backend URL is different from default

5. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically install dependencies and build your site

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize Site**:
   ```bash
   cd frontend
   netlify init
   ```

4. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

## Important Notes

- The `@netlify/plugin-nextjs` plugin is required and will be automatically installed during build
- Make sure your `netlify.toml` file is in the `frontend` directory
- The plugin handles all Next.js routing automatically
- API routes (like `/api/health`) will work automatically

## Troubleshooting

### Build Fails
- Check Node version (should be 18+)
- Verify all dependencies are installed
- Check build logs in Netlify dashboard

### Path Not Found Errors
- Ensure `netlify.toml` is in the `frontend` directory
- Verify `@netlify/plugin-nextjs` is in `package.json` devDependencies
- Check that base directory is set to `frontend` in Netlify settings

### Environment Variables Not Working
- Make sure variable names start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables


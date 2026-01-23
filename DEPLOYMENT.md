# Deployment Guide

## Quick Deploy Steps

### 1. Build the Production Version
```bash
cd /Users/dimitriosgeorgiou/Desktop/git/habit-tracker
npm run build:skip-check
```

This creates/updates the `dist` folder with all your latest changes.

### 2. Deploy to Vercel (Recommended)

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. **Drag and drop** the `dist` folder onto the deployment area
   - Path: `/Users/dimitriosgeorgiou/Desktop/git/habit-tracker/dist`
4. Wait for deployment to complete
5. **Important:** Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
     - `VITE_OPENAI_API_KEY` = your OpenAI API key (optional)

### 3. Deploy to Netlify (Alternative)

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. **Drag and drop** the `dist` folder
3. Wait for deployment
4. **Important:** Add environment variables:
   - Go to Site Settings → Environment Variables
   - Add the same variables as above

## Fixing "Origin returned error code" Error

This is a **CORS (Cross-Origin Resource Sharing)** error from Supabase. Here's how to fix it:

### Step 1: Add Your Deployed URL to Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Scroll down to **"Allowed Origins"** or **"CORS Settings"**
5. Add your deployed URL:
   - For Vercel: `https://your-app.vercel.app`
   - For Netlify: `https://your-app.netlify.app`
   - Also add: `http://localhost:5173` (for local development)
6. Click **Save**

### Step 2: Verify Environment Variables

Make sure your deployment platform (Vercel/Netlify) has the environment variables set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENAI_API_KEY` (optional)

### Step 3: Rebuild and Redeploy

After fixing CORS settings:
```bash
npm run build:skip-check
```
Then drag the `dist` folder again to redeploy.

## Notes

- The `dist` folder is **NOT** in git (it's in `.gitignore`) - this is correct!
- Always rebuild before deploying to get latest changes
- Environment variables must be set in your deployment platform
- CORS must be configured in Supabase dashboard for your deployed URL

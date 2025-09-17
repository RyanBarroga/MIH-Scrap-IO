# Deployment Instructions

## Issues Fixed

1. **API Endpoint**: Updated API_BASE to use current domain instead of localhost
2. **Database**: Configured to use in-memory SQLite for Vercel deployment
3. **Vercel Config**: Added proper environment variables and function configuration
4. **Puppeteer**: Added Vercel-specific browser configurations and fallback to mock data
5. **Error Handling**: Improved error handling and timeouts for serverless functions

## How to Deploy

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment - update API endpoints and database config"
   git push
   ```

2. **Redeploy on Vercel:**
   - Go to your Vercel dashboard
   - Find your project
   - Click "Redeploy" or it will auto-deploy from the git push

3. **Test the deployment:**
   - Visit your Vercel URL
   - Check the System Status - it should now show "Connected" for both Backend and Database
   - Try the "Start Extraction" button

## What Changed

- `client/public/index.html`: API_BASE now uses `window.location.origin + '/api'`
- `client/src/services/apiService.ts`: API_BASE_URL now uses `/api` (relative path)
- `server/database/init.js`: Uses in-memory database for Vercel, file-based for local
- `vercel.json`: Added VERCEL environment variable and function timeout
- `server/index.js`: Enhanced health check endpoint with environment info

## Testing

After deployment, you can test the health endpoint:
- Visit: `https://your-app.vercel.app/api/health`
- Should return status, environment info, and database type

The "delete my project" error should now be resolved as the app can properly connect to the backend API.

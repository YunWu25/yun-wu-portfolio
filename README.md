<div align="center">
<img widt2. **Update the base path:**
   - In `vite.config.ts`, change `/yun-wu-portfolio/` to match your repository name
   - Format: `/<your-repo-name>/`

3. **Push to GitHub:**00" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/14NtMmhDXjA0DWOxvsRwBFicKgV66LoMB

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This project is configured to automatically build and deploy to GitHub Pages on every push to the `main` branch.

### Setup:

1. **Enable GitHub Pages:**
   - Go to repository **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**

2. **Update the base path:**
   - In `vite.config.ts`, change `/yun-wu-portfolio/` to match your repository name
   - Format: `/<your-repo-name>/`

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```

4. **Monitor deployment:**
   - Go to the **Actions** tab in your repository
   - Watch the "Build and Deploy" workflow run
   - Once complete, your site will be live at: `https://<username>.github.io/<repo-name>/`

### Manual Deployment

You can also trigger a deployment manually from the **Actions** tab by clicking "Run workflow".


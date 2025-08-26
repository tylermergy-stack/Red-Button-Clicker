# Red Button Clicker

A tiny web game built with **Vite + React + Tailwind**.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages
1. Create a **new public repo** on GitHub, e.g. `red-button-clicker`.
2. Push this project to that repo.
3. In repo **Settings → Pages**, choose **Source: Deploy from a branch** and **Branch: `gh-pages`**.
4. Build locally:
   ```bash
   # in your shell
   export REPO_NAME=red-button-clicker   # set to your repo name
   npm run build
   ```
5. Publish the `dist/` folder to the `gh-pages` branch:
   ```bash
   git subtree push --prefix dist origin gh-pages
   ```
   (Or drag-drop the `dist/` contents into the `gh-pages` branch on GitHub.)

### Important for GitHub Pages paths
- If your repo name is different, set `REPO_NAME` before building so Vite sets the correct `base`.  
  Alternatively, edit `vite.config.js` and hardcode:
  ```js
  base: '/<your-repo>/'
  ```

## Use on iPhone
- Open your GitHub Pages URL in **Safari** (e.g. `https://<you>.github.io/<repo>/`).  
- First tap needs to come from the user before sound plays (iOS limitation).  
- Optional: Add to Home Screen from the Share menu to run full screen.

# X-Foresight project page

Static site for the X-Foresight technical report. No build step, no dependencies — just HTML, CSS, and a tiny bit of JS.

## Preview locally

From the project root:

```sh
python3 -m http.server 8000 --directory web
```

Then open <http://localhost:8000/> in Chrome (or any browser). The root URL detects browser language and forwards to `/en/` or `/zh/`.

In VS Code: install the **Live Server** extension, then right-click `web/index.html` → **Open with Live Server**.

> Opening the file directly via `file://` mostly works, but the localStorage-backed language toggle is scoped per-origin and the redirect uses `location.replace`, so a local HTTP server is the smoother choice.

## Layout

```
web/
  index.html          # redirects to /en/ (or /zh/ for zh-* browsers)
  en/index.html       # English page
  zh/index.html       # Chinese page (mirror)
  config.js           # arXiv / PDF / GitHub link constants — edit these
  assets/
    css/styles.css
    js/main.js
    img/              # web-ready figures (PNG/JPG converted from asset/pics/**)
    videos/           # drop closed-loop .mp4 clips here for the Demos section
  .nojekyll           # tells GitHub Pages to serve files as-is
```

## Updating the external links

Edit `web/config.js`:

```js
window.X_FORESIGHT_CONFIG = {
  ARXIV_URL:  "https://arxiv.org/abs/XXXX.XXXXX",
  PDF_URL:    "./assets/x-foresight.pdf",
  GITHUB_URL: "https://github.com/<user>/X_Foresight",
  YEAR: "2026"
};
```

The hero badges turn from muted/inactive into active links the moment a real URL replaces `"#"`.

## Adding demo videos (next iteration)

Place `.mp4` files under `web/assets/videos/`, then open both `en/index.html` and `zh/index.html` and replace the `<div class="demo-placeholder">…</div>` block with the commented-out `<div class="demo-grid">` template just below it, pointing each `<source>` at your file.

## Deploy to GitHub Pages

### Option A — dedicated user/org page (served at the root, like the reference site)

1. Create a new repo named exactly `<account>.github.io` (e.g. `x-foresight-1.github.io`).
2. Copy the **contents** of this `web/` folder to the repo root (so `index.html`, `en/`, `zh/`, `assets/`, `.nojekyll` live at the top).
3. `git push -u origin main`.
4. Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)`.

### Option B — project page on an existing repo (served at a subpath)

1. Keep the `web/` folder where it is and push the X_Foresight repo to GitHub.
2. Settings → Pages → Source: **Deploy from a branch** → `main` / `/web`.
3. Site URL: `https://<user>.github.io/X_Foresight/`.

All paths inside the HTML are relative, so both options work without edits.

The `.nojekyll` marker tells Pages to skip the Jekyll build and serve every file verbatim.

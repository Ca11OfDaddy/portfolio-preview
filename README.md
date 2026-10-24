# Gino Lee: portfolio and interactive CV

A static single-page site in plain HTML, CSS and JS. There's no build step and no dependencies.

```
index.html          page content (all CV text lives here)
styles.css          styles, dark/light themes, responsive and print rules
script.js           theme toggle, mobile menu, timeline expand/collapse, skill filters
Gino-Lee-CV.pdf     downloadable CV (generated from the site's print stylesheet)
assets/             favicon.svg, og-image.png (1200x630 social preview)
.nojekyll           tells GitHub Pages to serve files as-is
preview-*.png       screenshots for review (safe to delete before publishing)
```

## Preview locally
Open `index.html` in a browser, or run `python3 -m http.server 8000` in this folder and go to http://localhost:8000.

## Deploy to GitHub Pages
1. Create a public repository. For the address `https://<username>.github.io/`, name it exactly `<username>.github.io`. Any other name gives you `https://<username>.github.io/<repo>/`.
2. Upload the contents of this folder to the repository root, either through the web UI ("Add file" > "Upload files") or with git:
   ```bash
   git init && git add . && git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
3. In the repository, go to **Settings > Pages > Build and deployment**, set Source to "Deploy from a branch", choose Branch `main` and folder `/ (root)`, then save.
4. After about a minute the site is live at the address shown on that page.
5. Optional custom domain: add it under Settings > Pages > Custom domain, and point a CNAME DNS record at `<username>.github.io`.

## Before publishing
- In `index.html`, replace every `https://USERNAME.github.io/` (canonical, og:url, og:image, twitter:image) with the real URL.
- Fill in the items marked `PLACEHOLDER` or `[Placeholder]`: headshot, portfolio samples and MBA/AI projects.
- Regenerate `Gino-Lee-CV.pdf` after editing content. Open the page in Chrome, choose Print, then "Save as PDF" (A4). The print stylesheet produces the clean CV layout.

## Privacy note
The original Canva PDF includes current and expected salary, a mobile number and a cover-letter template. **Do not publish that file.** The PDF in this folder leaves all three out.

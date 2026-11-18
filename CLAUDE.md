# Flashcards Study App

A browser-based study tool. Users create question/answer flashcards, flip through them in review mode, and mark each card as **known** or **unknown**.

**Always ask me before adding any feature that wasn't in the original request.**

## Tech stack

- Plain **HTML, CSS, and vanilla JavaScript** only.
- Data storage: **`localStorage`** only. No backend, no database, no external APIs.
- Deployment: **GitHub Pages** (static hosting).

## File structure

Keep the whole app in exactly three files at the project root:

```
index.html   # markup and structure
style.css    # all styles
app.js       # all logic and localStorage handling
```

- Do not create additional source files, folders, or build output.
- Use relative paths (`./style.css`, `./app.js`) so the app works both locally and on GitHub Pages.

## Running the app

Open `index.html` directly in a browser. No build step, no dev server, no install.

Because it runs from `file://`, don't use ES modules (`type="module"`), `fetch()` of local files, or anything else that requires a server.

## Dependencies: hard rules

- **No npm packages, no `package.json`, no `node_modules`.**
- No bundlers, transpilers, or build tools.
- **Do not add any library or framework (including CDN links) without asking me first.**

# Invest 101

**Invest 101** is a single-page, multilingual educational website that demonstrates the power of compound investing. It features an interactive calculator with real-time chart updates, personalised projections, and a modern, responsive design.

The entire application is built with a "no build step" philosophy, using modern CDN-hosted libraries like Alpine.js, Tailwind CSS, and Chart.js. This allows it to be hosted for free and with zero configuration on static hosting platforms like GitHub Pages.

This project was generated from a detailed [Project Requirement Document](#).

## ✨ Features

* **F1: Interactive Calculator:** Adjust initial investment, monthly contributions, annual rate, and time horizon to see instant updates.
* **F2: Personalisation:** Optionally sign in with Google to save your calculator presets. Presets for guest users are saved in the browser's local storage.
* **F3: Multilingual UI:** The interface is available in English (EN), Spanish (ES), and Catalan (CA), with auto-detection from the browser and a manual language switcher.
* **F4: Modern, Responsive Design:** A clean "neo-fintech" look with dark/light mode toggle, designed mobile-first.
* **F5: Shareable Permalinks:** All calculator settings are encoded into the URL, making it easy to share your specific projection with others.
* **F6 (Stretch Goal):** PWA basics implemented for offline asset caching (via a simple service worker).

## 🚀 Deployment to GitHub Pages

This repository is pre-configured to deploy directly to GitHub Pages.

1. **Create a public GitHub repository** and push the contents of this project to it. Ensure the `docs` directory is at the root.
2. **Go to your repository's Settings > Pages.**
3. Under **Build and deployment**, set the **Source** to **Deploy from a branch**.
4. Set the **Branch** to `main` (or your default branch) and the folder to `/docs`.
5. Click **Save**. Your site will be published at `https://<your-username>.github.io/<your-repo-name>/`.

## 🛠 Tech Stack

| Layer         | Choice                                     | Rationale                                 |
| ------------- | ------------------------------------------ | ----------------------------------------- |
| Mark-up       | **HTML 5**                                 | Simplicity & SEO                          |
| Styling       | **Tailwind CSS 3** (via CDN)               | Utility classes, fast prototyping         |
| Interactivity | **Alpine.js 3**                            | Lightweight reactivity without build step |
| Charts        | **Chart.js 4**                             | Lightweight, versatile charting           |
| i18n          | **i18next** (browser-cdn)                  | Robust runtime translation                |
| Auth          | **Firebase Auth** (Google/Email)           | Works fully client-side                   |
| Build         | **No build step required** (purely CDN)    | Maximum simplicity and portability        |

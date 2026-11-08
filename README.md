# Aditya Yanamala — Portfolio

Ocean-themed interactive portfolio with responsive desktop, tablet, and mobile layouts.

## Upload to your repository

Extract the ZIP, then copy its contents into your repository's root. Keep `index.html`, `assets/`, `Aditya_Yanamala_Resume.pdf`, and `og-card.png` together. No install or build step is needed to preview: compiled React Bits assets are included.

The page uses static HTML, CSS, and JavaScript with a locally bundled React Bits Waves background. Content templates and core interactions live in `index.html`. The base visual system is in `assets/redesign.css`; chapter layouts, project illustrations, and interest controls are styled in `assets/sections.css`. The scattered object controls are arranged by `assets/ocean.js` and `assets/scattered-eggs.css`. Local motion modules provide the hero entrance and a subtle desktop headline ripple.

## Add your profile photo

Replace `assets/headshot.JPG` with your headshot using the same filename. The arch frame crops it centrally. A square image works well. For JPG or WebP instead, upload the file and update the `.profile-photo` image's `src` in `index.html`.

## Add the 15 food photos

Upload your images into `assets/food/`. In `index.html`, find `id="food-grid"` and replace the 15 placeholder image paths, for example:

```html
<img src="./assets/food/photo-01.jpg" alt="A description of the food">
```

Current placeholders are `photo-01.svg` through `photo-15.svg`. Update the extension and filename to match each uploaded image, and give each photo a descriptive alt text. The collage has no visitor upload controls.

## Preview locally

Open `index.html` in a browser, or run this command from the repository folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Interactions

- On desktop, the hub—including all five gadgets—fits the viewport without scrolling. Five numbered navigation entries open fullscreen sections. On mobile, these become a readable vertical list.
- About, Experience, Skills, and Contact each use a wave from a different edge. Projects expands from the center. Content swaps only after the wave covers the screen; effects finish in approximately 0.6 seconds and respect reduced-motion preferences.
- Projects include filters, a random project picker, and six technical case studies. Filters and scroll position survive navigation and refresh.
- Five objects are scattered around the home page with small “Click me” labels. They reflow into a staggered arrangement on phones.
- The controller opens a 15-second aim game with hits, misses, accuracy, and replay.
- The Valorant mark opens a dismissible profile with Radiant, #34 North America, Reyna, and Jett.
- The food illustration opens the 15-photo collage.
- Clicking the basketball spawns a hoop, sends the ball through it, and clears the hoop after the shot. The notebook keeps its original message.
- The Konami code (Up, Up, Down, Down, Left, Right, Left, Right, B, A) toggles deep-sea mode.

## Assets

VALORANT artwork is copyright Riot Games; local agent/rank assets were obtained via Valorant-API. IBM logo sourced from Simple Icons v11; Capital One icon from capitalone.com; Alura logo from alura.co. Brand marks remain the property of their owners. The included PDF is the supplied resume.

This export does not publish or deploy the website.

## React Bits background

The actual React Bits Waves component is in `src/react-bits/Waves.jsx`, with its upstream license in `src/react-bits/LICENSE.md`. It creates interactive ocean lines, includes a pause button, and rests under reduced motion. The built JS and CSS are committed in `assets/`, so the Python preview command still works without npm.

Only if you edit the React source, rebuild with:

```bash
npm ci
npm run build:effects
```

## Sections and case studies

Share sections directly with `#about`, `#experience`, `#projects`, `#skills` or `#contact`.
The panel header switches between sections, and browser Back/Forward and refresh restore the current view.

Case studies use routes such as `#projects/signvision` and `#projects/glancear`. Their technical copy is in `assets/data/case-studies.js`; source notes are in `CASE-STUDY-SOURCES.md`. Skills link directly to case studies or roles, including `#experience/capital-one`.

Routing, cached views and evidence links live in `assets/navigation.js`. The temporary hoop interaction is in `assets/basketball.js`, with styles in `assets/portfolio-features.css`.

Run the browser feature checks on macOS with Google Chrome and Node 22+:

```bash
node tests/browser-features.mjs
node tests/hub-transitions.mjs
```

The Contact section includes a local note composer and optional opening-line helper. “Open email draft” opens the visitor's email client with the message filled in; it does not send from the website. Draft text stays in the cached Contact view when switching sections. Copy email and direct social links remain available.

# Aditya Yanamala — Portfolio

Full-screen 3D solar-system portfolio with a central black hole, dense constellation field, shooting stars, decorative moons, and ten section/easter egg objects moving through independently tilted orbital planes.

## Upload to your repository

Extract the ZIP, then copy its contents into your repository's root. Keep `index.html`, `assets/`, `Aditya_Yanamala_Resume.pdf`, and `og-card.png` together. No install or build step is needed to preview: compiled React Bits assets are included.

The page uses static HTML, CSS, and JavaScript. Content templates and core interactions live in `index.html`. The space theme is in `assets/space.css`, and `assets/space.js` projects the 3D star field, constellation connections, and orbital paths. Quaternion camera and orbital geometry are in `assets/universe-math.mjs`, and the ambient planets, curved star trails, and ice belt are in `assets/space-decoration.mjs`; destination environments and travel effects are in `assets/adventure.css`. Chapter layouts and project illustrations remain in `assets/sections.css`. Local motion modules provide the hero entrance and a subtle desktop headline ripple. All subpage copy, images, case studies, and easter egg interactions are retained. The landing view contains only the solar system and short navigation labels; the introductory text, profile card, and top bar were removed as requested.

## Add your profile photo

Replace `assets/headshot.JPG` with your headshot using the same filename. The circular satellite frame crops it centrally. A square image works well. For JPG or WebP instead, upload the file and update the `.profile-photo` image's `src` in `index.html`.

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

- The solar system fills the desktop viewport and adapts to phones and landscape screens. All ten icons are visible initially and after Reset; overlap and off-screen travel are allowed during rotation. Five section objects use person, briefcase, project cube, code, and envelope shapes. The basketball, controller, food, notebook, and Valorant mark orbit alongside them.
- Destination-specific travel transitions cover the screen before content swaps. They finish in approximately 0.6 seconds and use immediate navigation under reduced motion.
- Projects include filters, a random project picker, and six technical case studies. Filters and scroll position survive navigation and refresh.
- Drag empty space or an object to spin the 3D system like a globe. Mouse-wheel and toolbar controls zoom; phones support one-finger rotation and pinch zoom. The focused map also accepts arrow keys and Home. Dragging an object suppresses accidental navigation.
- Hovering or keyboard-focusing an object freezes motion for selection. Pause rests the scene; manual rotation remains available. Reset restores orientation, zoom, and an opening layout with all destinations visible. Fullscreen is available when supported.
- The Destinations menu offers direct section links and all five easter eggs, independent of camera orientation. Focus returns to the menu after a menu-originated visit.
- Each subpage has its own arrival environment: lunar terrain, a ringed world, a rocky world, a constellation, or a signal beacon. Experience has direct role shortcuts. Destination-specific lunar, slingshot, warp, constellation, signal, and return transitions preserve covered content swaps. All existing copy and easter egg messages remain unchanged.
- The controller opens a 15-second aim game with hits, misses, accuracy, and replay.
- The Valorant mark opens a dismissible profile with Radiant, #34 North America, Reyna, and Jett.
- The food illustration opens the 15-photo collage.
- Clicking the basketball spawns a hoop, sends the ball through it, and clears the hoop after the shot. The notebook keeps its original message.
- The Konami code (Up, Up, Down, Down, Left, Right, Left, Right, B, A) toggles deep-sea mode.

## Assets

VALORANT artwork is copyright Riot Games; local agent/rank assets were obtained via Valorant-API. IBM logo sourced from Simple Icons v11; Capital One icon from capitalone.com; Alura logo from alura.co. Brand marks remain the property of their owners. The included PDF is the supplied resume.

This export does not publish or deploy the website.

## Space background

`assets/space.js` draws the decorative star field and moving orbital trails with Canvas 2D. Shooting stars cross the screen, eight comet-like stars leave curved orbital trails, and nine decorative icy, rocky, gas, or ringed planets orbit alongside the destinations. A tilted ice-asteroid belt adds faceted shards and crystalline glints, with fewer particles on phones. All are nonclickable Canvas scenery; orbital trails and the ice belt rest with the scene under pause or reduced motion. The black-hole core uses CSS; its accretion disc, foreground orbital segments, and 3D star network are projected through Canvas 2D. All ten destinations remain native keyboard-accessible buttons with upright labels. Perspective changes their apparent size and brightness. The opening view fits every destination; afterward, icons follow their projected orbits directly and may overlap or pass out of view. Composited transforms keep dragging smooth, and the Destinations menu always provides direct access. Reduced motion shows a still scene; open sections, dialogs, basketball shots, and hidden browser tabs also stop the animation. No new dependencies or build step are required.

The previous React Bits Waves source and license remain in `src/react-bits/` for reference; those compiled assets are no longer loaded by the page.

Only if you want to rebuild the retained React source:

```bash
npm ci
npm run build:effects
```

## Sections and case studies

Share sections directly with `#about`, `#experience`, `#projects`, `#skills` or `#contact`.
The panel header switches between sections, and browser Back/Forward and refresh restore the current view.

Case studies use routes such as `#projects/signvision` and `#projects/glancear`. Their technical copy is in `assets/data/case-studies.js`; source notes are in `CASE-STUDY-SOURCES.md`. Skills link directly to case studies or roles, including `#experience/capital-one`.

Routing, cached views and evidence links live in `assets/navigation.js`. The temporary hoop interaction is in `assets/basketball.js`, with styles in `assets/portfolio-features.css`.

Run the browser checks one at a time on macOS with Google Chrome and Node 22+:

```bash
node tests/browser-features.mjs
node tests/hub-transitions.mjs
node tests/contact-skills.mjs
node tests/universe-math.mjs
```

The Contact section includes a local note composer and optional opening-line helper. “Open email draft” opens the visitor's email client with the message filled in; it does not send from the website. Draft text stays in the cached Contact view when switching sections. Copy email and direct social links remain available.

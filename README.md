# Aditya Yanamala — Portfolio

Ocean-themed interactive portfolio, exported from review Version 8.

## Upload to your repository

Extract the ZIP, then copy its contents into your repository's root. Keep `index.html`, `assets/`, `Aditya_Yanamala_Resume.pdf`, and `og-card.png` together. No install or build step is needed.

The website is static HTML, CSS, and JavaScript. Page styling, content templates, and interactions live in `index.html`.

## Add your profile photo

Replace `assets/headshot.png` with your headshot using the same filename. The circular frame crops it centrally. A square image works well. For JPG or WebP instead, upload the file and update the `.profile-photo` image's `src` in `index.html`.

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

- Five navigation bubbles open fullscreen sections.
- About, Experience, Skills, and Contact each use a wave from a different edge. Projects expands from the center. Effects finish in approximately 0.6 seconds and respect reduced-motion preferences.
- Projects include filters and a random project picker.
- The controller opens a 15-second aim game with hits, misses, accuracy, and replay.
- The Valorant mark opens a dismissible profile with Radiant, #34 North America, Reyna, and Jett.
- The food illustration opens the 15-photo collage.
- Basketball and reading illustrations contain small surprises.
- The Konami code (Up, Up, Down, Down, Left, Right, Left, Right, B, A) toggles deep-sea mode.

## Assets

VALORANT artwork is copyright Riot Games; local agent/rank assets were obtained via Valorant-API. IBM logo sourced from Simple Icons v11; Capital One icon from capitalone.com; Alura logo from alura.co. Brand marks remain the property of their owners. The included PDF is the supplied resume.

This export does not publish or deploy the website.

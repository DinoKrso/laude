# Laude - prodajna stranica

React + Vite stranica sa 3D modelom stalka (React Three Fiber) i scroll animacijama (GSAP ScrollTrigger + Lenis).

## Pokretanje

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gotova stranica u folderu dist/
npm run preview    # pregled builda
```

`dist/` se može direktno postaviti na Netlify, Vercel ili bilo koji statički hosting.

## Gdje šta mijenjati

| Šta | Fajl |
|---|---|
| Ime brenda, WhatsApp, e-mail, telefon | `src/config.js` |
| Tekstovi poglavlja, sekcije, specifikacije, FAQ | `src/content.js` |
| Scroll animacija (redoslijed, kamera, rastavljanje) | `src/components/Story.jsx` |
| Materijali, boje modela, NFC talasi, QR linija | `src/three/StandModel.jsx` |
| Svjetla, kamera, sjene | `src/three/StandScene.jsx` |
| Dizajn (boje, fontovi, raspored) | `src/styles/global.css` |
| 3D model | `public/stand.glb` (dijelovi: plate_body, logo, tagline, stars, qr, nfc_icon, nfc_tag, nfc_coil, base) |

## Kako radi animacija

`src/three/story.js` drži stanje scene (rotacija, kamera, koliko je koji dio izdignut).
GSAP timeline u `Story.jsx` mijenja to stanje dok se skrola, a `useFrame` u modelu ga svaki frame glatko primjenjuje.
Ako korisnik ima uključeno smanjenje animacija ili nema WebGL, stranica se prikaže kao obična, bez 3D-a.

## Promo video (Instagram Reel)

`promo.html` je 16-sekundni vertikalni video (1080×1920) napravljen od istog 3D modela. Svaki frame se postavlja sa `window.__setTime(t)`, pa je render uvijek identičan.

- Pregled u browseru: `npm run dev`, pa otvori `http://localhost:5173/promo.html` i u konzoli pozovi npr. `__setTime(7)`.
- Tekstovi i tajming: `src/promo/Promo.jsx`, izgled: `src/promo/promo.css`.
- Ponovni render u MP4 (treba Playwright i ffmpeg):
  ```bash
  npm run dev            # u jednom terminalu
  npx playwright install chromium
  node scripts/render-reel.mjs
  ```

# ♞ Vinisha's Portfolio

My personal portfolio, built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step. **Chess-themed**: each project is a hand-drawn chess piece that turns as you scroll, and my live Chess.com stats are right there too.

**Live site:** [vinisha231.github.io/portfolio](https://vinisha231.github.io/portfolio/)

## What's inside

- ♟ **Projects as real 3D pieces** the 8 headline projects each get a full scroll scene with a true 3D black chess piece (built in Three.js by revolving a lathe profile, the way real pieces are turned) that spins around its vertical axis as you scroll. Falls back to a flat SVG piece if WebGL or reduced-motion applies. The 8 lab experiments are pawns you tap to read.
- ♚ **Live Chess.com stats** rapid, blitz, and bullet ratings with peak, plus tactics, league, and years playing, pulled live from the public Chess.com API for [@Vinu2023](https://www.chess.com/member/Vinu2023).
- ⛶ **Flip the board** ivory (light) and midnight (dark) wood-board themes, remembered between visits.
- 🎛️ **⌘K command palette** for keyboard navigation (doubles as the mobile menu).
- ⌨️ **Playable terminal** try `help`, `rating`, `fen`, `stats` (live), or `sudo hire-me`.
- ♞ **Flourishes** captured-piece particle bursts on click, smooth Lenis scrolling, GSAP scroll reveals, parallax, count-up stats, scramble-in titles, custom cursor, magnetic buttons, and 3D-tilt cards.
- 🕹️ **Konami code** (↑↑↓↓←→←→BA) plays a "Brilliant!!" move.
- 📱 Fully responsive, with a no-JS fallback and `prefers-reduced-motion` support.

## Running locally

```bash
git clone https://github.com/vinisha231/portfolio.git
cd portfolio
open index.html   # or any static server, e.g. python3 -m http.server
```

## Deployment

Deployed automatically via **GitHub Pages** from the `main` branch.

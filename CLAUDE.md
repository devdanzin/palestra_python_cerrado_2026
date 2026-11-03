# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

Source material for a single conference talk (Python Cerrado 2026, 2026-11-07): **"Quebrando o seu código e o Python"** ("Breaking your code and Python") by Daniel Diniz (devdanzin). All content is in Brazilian Portuguese (pt-BR). There is no application, package, build step, or test suite here; the deliverable is the talk itself.

The talk shows how bugs are found in Python code, in extensions, and in Python implementations (CPython, PyPy, RustPython), with real examples of bugs found — including in projects suggested by attendees/maintainers. It follows up on the author's Python Brasil 2026 talk "Caçando bugs em Python: do olho humano à IA" (repo `devdanzin/palestra_python_brasil_2026`), which focused on techniques and tools.

## Repository layout

- `roteiro.md` — the working script/outline for the talk. The "Linha do tempo" section is a planning aid that will be removed before the talk.
- `rascunho.md` — drafts and notes.
- `apresentacao/cerrado.html` — the slide deck, built on **reveal.js** 6.0.2. No build step: the HTML loads prebuilt files from `apresentacao/dist/` via relative paths.
- `apresentacao/dist/` — reveal.js files copied from a local reveal.js checkout (core JS/CSS, the black theme, and the zoom/notes/search/markdown/highlight plugins). `dist/theme/black.css` and `dist/reveal.css` carry the author's local modifications (unminified), so edit them directly; they are not regenerated from SCSS. `black.css` references `../../images/qrcode.svg`, so keep the `dist/theme/` ↔ `images/` layout.
- `apresentacao/images/` — slide images.
- `package.json` / `vite.config.js` — dev server only: `npm start` serves `apresentacao/` with Vite at http://localhost:8000/cerrado.html. Vite reloads on HTML changes by itself; the small plugin in `vite.config.js` also triggers a full reload when any other file under `apresentacao/` changes (Vite ignores `<link>`ed CSS and images otherwise). `node_modules/` is gitignored.

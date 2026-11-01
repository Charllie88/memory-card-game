# Memory Card Game

A responsive matching game built with React and Vite. Flip two cards at a time, find all eight pairs, and see your move count and elapsed time.

## Features

- Sixteen shuffled cards with eight matching emoji pairs.
- Move counter and elapsed-time display.
- Mismatched cards turn back over automatically; input is locked during the brief reveal.
- Completion announcement and a New game button.
- Keyboard-operable cards with accessible labels and screen-reader status updates.
- Responsive layout, visible focus states, and reduced-motion support.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To create and preview a production build:

```sh
npm run build
npm run preview
```

## Project structure

- `index.html` - App entry document and metadata.
- `src/main.jsx` - React root and stylesheet entry point.
- `src/App.jsx` - Game state, card interactions, timer, and game interface.
- `src/styles.css` - Responsive game styles and accessibility states.

The project uses React and Vite; no additional runtime dependencies are required.

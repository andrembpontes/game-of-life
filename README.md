# Conway's Game of Life

A React-based implementation of Conway's Game of Life using Vite.js.

## Overview

This project implements the classic cellular automaton devised by mathematician John Conway. The game is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input.

## Rules

1. Any live cell with fewer than two live neighbors dies (underpopulation)
2. Any live cell with two or three live neighbors lives on to the next generation
3. Any live cell with more than three live neighbors dies (overpopulation)
4. Any dead cell with exactly three live neighbors becomes a live cell (reproduction)

## Technologies Used

- React.js
- Vite.js
- HTML5/CSS3
- JavaScript (ES6+)

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Development

To build the project for production:
```bash
npm run build
```

## Deployment

This project can be deployed to any static file hosting service (e.g., GitHub Pages, Netlify, Vercel).

## License

MIT License

## Author

Created as part of the Windsurf Game of Life project.

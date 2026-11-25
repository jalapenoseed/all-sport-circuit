# All Sport Circuit

[Play in your browser](https://jalapenoseed.github.io/all-sport-circuit/)

An original nine-sport arcade built with TypeScript and a software-projected HTML Canvas renderer. Play directly or call tactics as a manager. The second side can be a CPU or a second person on the same keyboard.

Championship is the default format. Football and basketball use four quarters, soccer uses two halves, and hockey uses three periods. Baseball has three innings, strikeouts, baserunners and extra innings. Golf plays six holes for total strokes. Tennis plays a short set and ping-pong plays best of three. The steeplechase uses three different hurdle layouts and aggregate times. Quick play keeps the shorter exhibition formats.

## Controls

Player one uses WASD, Space for the sport action, E to pass or sprint, and Q to select the nearest defender. Player two uses the arrow keys, Enter, slash, and period. Managers can change tactics during play. C blends between the overhead, isometric, and chase cameras. Escape pauses the match. The in-game controls describe each sport.

## Development

Use Node.js 24 or newer. Run `node build.mjs` to generate the self-contained `dist/index.html`. Open that file directly for offline play. Run `node --test tests/championship.test.mjs` for the scoring regression checks. Pushes to main rebuild and deploy the game to GitHub Pages.

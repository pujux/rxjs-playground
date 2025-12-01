# RxJS Playground

Interactive sandbox for experimenting with RxJS. Visualizes emissions on a live timeline plus an event log. The helper `rxObserver()` bridges your code to the UI so you can see values as they flow.

## Features

- Monaco editor with inline RxJS typings and autocompletion
- Sandboxed execution of your code (web worker) so the UI stays responsive
- Timeline chart and event log for each Observable you subscribe with `rxObserver(seriesName?)`
- Preloaded RxJS globals so you can write examples without imports

## Getting Started

Prerequisites: Node 18+ and `pnpm` (preferred). `npm` will also work if you prefer.

```bash
# Install dependencies
pnpm install

# Run the dev server
pnpm dev
```

Then open http://localhost:3000 and start editing the code sample. The `rxjs` object is available globally in the editor. Pass `rxObserver('label')` to `subscribe` (or inside `tap`) to plot emissions:

```js
const { interval, map, take } = rxjs;

const numbers$ = interval(200).pipe(
  map((n) => n * 2),
  take(10)
);

numbers$.subscribe(rxObserver("doubles"));
```

Use the **Run Code** button to execute, **Stop** to halt the worker, and **Clear** to reset the timeline.

## Additional Scripts

- `pnpm lint` – run ESLint
- `pnpm typecheck` – TypeScript checks
- `pnpm build` – production build
- `pnpm start` – start the built app

During local development the editor fetches RxJS type definitions from jsDelivr for better autocomplete; ensure you have a network connection the first time you open the editor.

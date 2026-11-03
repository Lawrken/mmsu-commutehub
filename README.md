# MMSU CommuteHub

A local transportation planning prototype for MMSU commuters. Route geometry, vehicle positions, arrival times, fares, occupancy, and advisories are illustrative examples.

## Run locally

Install Node.js 20.9 or newer, then run:

```bash
npm install
npm run dev -- --webpack
```

Open http://localhost:3000. Run `npm run build` and `npm start` for a production build. The map uses OpenStreetMap tiles when available and falls back to an approximate schematic if they cannot load.

## Presentation walkthrough

1. Open **Routes**, choose Laoag City Terminal and MMSU Batac Main Campus, and compare example options.
2. Open a route to view its stops, estimated fare, arrival, and occupancy, then choose **Start trip**.
3. Open **Trips** and advance through the manual stages. Completing the trip adds it to history.
4. Use **Departure planner** to calculate when to leave for a class, then open the suggested route.
5. Use **Community** to submit an observation, and **Alerts** to browse example advisories.
6. Review saved routes and statistics under **Profile**. Reset demo clears local activity after confirmation.

Data is saved in the current browser's localStorage. Existing valid data from the previous version is migrated automatically. The application does not use live tracking or real transport data.

## Checks

Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`. To run the isolated browser checks, start the dev server separately and run `npm run test:e2e`; the Playwright configuration uses an installed Google Chrome.

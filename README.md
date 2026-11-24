# Ziggy's Day

A short animated film in the browser. Angie and Rob decide how to spend the day with their dog Ziggy, who reacts to every idea. All three are live AI agents, so every run ends differently.

## Run it (VS Code)

1. Unzip, then in VS Code: File > Open Folder > `ziggys-day`
2. Terminal > New Terminal
3. `npm install`
4. `npm run dev`
5. Open http://localhost:3000 in Chrome

Click Next (or press Space) to advance. When the film ends, the app writes
`decisions.jsonl` into this folder. `npm run export-log` writes it without
clicking through.

## Where things live

- `lib/script.ts`: all dialogue and the final decision. Edit lines here.
- `lib/agents.ts`: names, colors, screen positions.
- `components/`: Stage, CharacterSlot, SpeechBubble, DecisionLog.
- `app/globals.css`: all animation.
- `public/art/`: optional images, exact lowercase names: angie.png, rob.png,
  ziggy.png, living-room.png. Missing files fall back to built-in drawings.
- `analytics/`: the two Bruin SQL files.

## Bruin (run after decisions.jsonl exists)

1. Install: `curl -LsSf https://getbruin.com/install/cli | sh`
2. Next to this folder: `bruin init default ziggys-analytics`
3. Delete the three sample assets that init creates. Copy
   `analytics/decisions.sql` into the new pipeline's `assets/` folder.
4. In that file, replace `/FULL/PATH/TO/...` with the full path to
   `decisions.jsonl`.
5. `bruin validate`, then `bruin run`.
6. For the last scene, run the query in `analytics/which-ending-wins.sql`
   and screenshot the result.

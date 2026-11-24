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
- `analytics/`: the Bruin pipeline (see below).

## Bruin (run after decisions.jsonl exists)

`analytics/` is a ready-to-run Bruin pipeline that loads `decisions.jsonl`
into DuckDB (`analytics/ziggy.duckdb`). Run everything from this folder.

1. Install: `curl -LsSf https://getbruin.com/install/cli | sh`
2. First time only: `cp bruin.example.yml .bruin.yml`
3. `bruin validate analytics`, then `bruin run analytics`
4. For the last scene, run the final query and screenshot the result:
   `bruin query --connection duckdb-default --query "$(cat analytics/which-ending-wins.sql)"`

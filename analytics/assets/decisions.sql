/* @bruin

name: pipeline.decisions
type: duckdb.sql
materialization:
  type: table

@bruin */

-- Replace the path below with the FULL path to your decisions.jsonl.
-- Mac example: /Users/yourname/Desktop/hackathon/ziggys-day/decisions.jsonl
SELECT
  run_id,
  mode,
  twist,
  turn,
  agent,
  stance,
  action,
  place,
  agreement,
  consensus,
  text
FROM read_json_auto('/FULL/PATH/TO/ziggys-day/decisions.jsonl')

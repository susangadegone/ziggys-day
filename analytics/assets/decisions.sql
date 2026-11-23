/* @bruin

name: pipeline.decisions
type: duckdb.sql
materialization:
  type: table

@bruin */

-- Replace the path below with the FULL path to your decisions.jsonl.
-- Mac example: /Users/yourname/Desktop/hackathon/ziggys-day/decisions.jsonl
SELECT
  agent,
  stance,
  veto,
  consensus,
  turn
FROM read_json_auto('/FULL/PATH/TO/ziggys-day/decisions.jsonl')

/* @bruin

name: pipeline.decisions
type: duckdb.sql
materialization:
  type: table

@bruin */

-- Reads decisions.jsonl from the repo root. Run bruin from the repo root:
--   bruin run analytics
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
FROM read_json_auto('decisions.jsonl')

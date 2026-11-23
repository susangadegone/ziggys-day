-- The last scene of the film. Screenshot this result.
-- Replace the path with the FULL path to decisions.jsonl.
SELECT
  agent,
  COUNT(*) FILTER (WHERE veto) AS vetoes,
  ROUND(AVG(consensus), 2)     AS avg_consensus,
  COUNT(*)                     AS lines_spoken
FROM read_json_auto('/FULL/PATH/TO/ziggys-day/decisions.jsonl')
GROUP BY agent
ORDER BY lines_spoken DESC

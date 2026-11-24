-- The last scene of the film. Screenshot this result.
-- Run after `bruin run ziggys-analytics`, from the bruin folder:
--   bruin query --connection duckdb-default --query "$(cat /path/to/which-ending-wins.sql)"
-- Each run's winner is the character who ended it most satisfied.
WITH final_mood AS (
  SELECT run_id, agent, arg_max(agreement, turn) AS final_agreement
  FROM pipeline.decisions
  GROUP BY run_id, agent
),
ranked AS (
  SELECT *, row_number() OVER (PARTITION BY run_id ORDER BY final_agreement DESC) AS rk
  FROM final_mood
),
totals AS (
  SELECT agent,
         COUNT(*)                                                AS lines,
         COUNT(*) FILTER (WHERE action IN ('bark', 'sulk', 'annoyed')) AS protests,
         MODE(action)                                            AS favorite_action,
         MODE(place)                                             AS favorite_place
  FROM pipeline.decisions
  GROUP BY agent
)
SELECT
  r.agent,
  COUNT(*) FILTER (WHERE r.rk = 1)   AS days_won,
  COUNT(*)                           AS runs,
  ROUND(AVG(r.final_agreement), 2)   AS avg_final_satisfaction,
  ANY_VALUE(t.protests)              AS protests,
  ANY_VALUE(t.favorite_action)       AS favorite_action,
  ANY_VALUE(t.favorite_place)        AS favorite_place
FROM ranked r
JOIN totals t USING (agent)
GROUP BY r.agent
ORDER BY days_won DESC, avg_final_satisfaction DESC

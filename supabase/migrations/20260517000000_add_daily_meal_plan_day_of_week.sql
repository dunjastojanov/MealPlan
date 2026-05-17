-- Day-of-week indicator for daily meal plans (one plan per member per weekday).

CREATE TYPE public.day_of_week AS ENUM (
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
);

ALTER TABLE public.daily_meal_plans
  ADD COLUMN day_of_week public.day_of_week;

DO $$
DECLARE
  over_limit_count integer;
BEGIN
  SELECT COUNT(*)::integer
  INTO over_limit_count
  FROM (
    SELECT user_id
    FROM public.daily_meal_plans
    GROUP BY user_id
    HAVING COUNT(*) > 7
  ) over_limit;

  IF over_limit_count > 0 THEN
    RAISE EXCEPTION
      'Cannot add day_of_week: at least one household member has more than 7 daily meal plans. Remove extras before migrating.';
  END IF;
END $$;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY created_at, id
    ) AS rn
  FROM public.daily_meal_plans
),
days AS (
  SELECT *
  FROM (
    VALUES
      (1, 'monday'::public.day_of_week),
      (2, 'tuesday'::public.day_of_week),
      (3, 'wednesday'::public.day_of_week),
      (4, 'thursday'::public.day_of_week),
      (5, 'friday'::public.day_of_week),
      (6, 'saturday'::public.day_of_week),
      (7, 'sunday'::public.day_of_week)
  ) AS day_map (rn, day_of_week)
)
UPDATE public.daily_meal_plans AS plan
SET day_of_week = days.day_of_week
FROM ranked
JOIN days ON days.rn = ranked.rn
WHERE plan.id = ranked.id;

ALTER TABLE public.daily_meal_plans
  ALTER COLUMN day_of_week SET NOT NULL;

ALTER TABLE public.daily_meal_plans
  ADD CONSTRAINT daily_meal_plans_user_day_key UNIQUE (user_id, day_of_week);

COMMENT ON COLUMN public.daily_meal_plans.day_of_week IS
  'Which day of the week this plan applies to.';

COMMENT ON TABLE public.daily_meal_plans IS
  'A member''s daily meal list for one weekday. At most one plan per member per day of the week.';

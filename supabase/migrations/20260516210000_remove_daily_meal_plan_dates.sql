-- One daily meal plan per user per group; no calendar dates on daily plans.

ALTER TABLE public.daily_meal_plans
  DROP CONSTRAINT IF EXISTS daily_meal_plans_meal_plan_group_id_user_id_plan_date_key;

-- Keep the oldest row when legacy data has multiple dates per user in the same group.
DELETE FROM public.daily_meal_plans older
USING public.daily_meal_plans newer
WHERE older.meal_plan_group_id = newer.meal_plan_group_id
  AND older.user_id = newer.user_id
  AND older.id > newer.id;

DROP INDEX IF EXISTS public.daily_meal_plans_plan_date_idx;

ALTER TABLE public.daily_meal_plans
  DROP COLUMN plan_date;

ALTER TABLE public.daily_meal_plans
  ADD CONSTRAINT daily_meal_plans_group_user_key UNIQUE (meal_plan_group_id, user_id);

COMMENT ON TABLE public.meal_plan_groups IS
  'A meal plan for one or more household members; each member has one daily meal plan row.';
COMMENT ON TABLE public.daily_meal_plans IS
  'One member''s meals within a meal plan group (not tied to a calendar date).';

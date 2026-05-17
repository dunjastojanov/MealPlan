-- One daily meal plan per household member; meal plan groups removed.

DELETE FROM public.daily_meal_plans older
USING public.daily_meal_plans newer
WHERE older.user_id = newer.user_id
  AND older.id > newer.id;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'daily_meal_plans'
      AND column_name = 'meal_plan_group_id'
  ) THEN
    ALTER TABLE public.daily_meal_plans
      DROP CONSTRAINT IF EXISTS daily_meal_plans_group_user_key;

    ALTER TABLE public.daily_meal_plans
      DROP CONSTRAINT IF EXISTS daily_meal_plans_meal_plan_group_id_fkey;

    DROP INDEX IF EXISTS public.daily_meal_plans_group_id_idx;

    ALTER TABLE public.daily_meal_plans
      DROP COLUMN meal_plan_group_id;
  END IF;
END $$;

ALTER TABLE public.daily_meal_plans
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'daily_meal_plans_user_id_key'
  ) THEN
    ALTER TABLE public.daily_meal_plans
      ADD CONSTRAINT daily_meal_plans_user_id_key UNIQUE (user_id);
  END IF;
END $$;

DROP TABLE IF EXISTS public.meal_plan_groups;

COMMENT ON TABLE public.daily_meal_plans IS
  'One member''s daily meal list (not tied to a calendar date).';

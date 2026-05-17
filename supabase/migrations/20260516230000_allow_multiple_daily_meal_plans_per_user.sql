-- Allow multiple daily meal plans per household member.

ALTER TABLE public.daily_meal_plans
  DROP CONSTRAINT IF EXISTS daily_meal_plans_user_id_key;

COMMENT ON TABLE public.daily_meal_plans IS
  'A member''s daily meal list (not tied to a calendar date). A member may have multiple plans.';

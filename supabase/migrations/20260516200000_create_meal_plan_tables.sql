-- A meal plan group holds one daily meal plan per household member (meals for that person).

CREATE TABLE public.meal_plan_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.meal_plan_groups IS
  'A meal plan for one or more household members; each member has one daily meal plan row.';

CREATE TABLE public.daily_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_group_id uuid NOT NULL REFERENCES public.meal_plan_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  UNIQUE (meal_plan_group_id, user_id)
);

CREATE INDEX daily_meal_plans_group_id_idx ON public.daily_meal_plans (meal_plan_group_id);
CREATE INDEX daily_meal_plans_user_id_idx ON public.daily_meal_plans (user_id);

COMMENT ON TABLE public.daily_meal_plans IS
  'One member''s meals within a meal plan group (not tied to a calendar date).';
COMMENT ON COLUMN public.daily_meal_plans.user_id IS
  'The household member this plan is for.';

CREATE TABLE public.daily_meal_plan_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_meal_plan_id uuid NOT NULL REFERENCES public.daily_meal_plans(id) ON DELETE CASCADE,
  meal_id uuid NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0)
);

CREATE INDEX daily_meal_plan_meals_plan_id_idx ON public.daily_meal_plan_meals (daily_meal_plan_id);
CREATE INDEX daily_meal_plan_meals_meal_id_idx ON public.daily_meal_plan_meals (meal_id);

COMMENT ON TABLE public.daily_meal_plan_meals IS
  'A meal assigned to a daily meal plan. Use sort_order for display sequence.';

ALTER TABLE public.meal_plan_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_meal_plan_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access"
  ON public.meal_plan_groups
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated full access"
  ON public.daily_meal_plans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated full access"
  ON public.daily_meal_plan_meals
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

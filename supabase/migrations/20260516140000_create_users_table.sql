CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  calorie_goal numeric NOT NULL CHECK (calorie_goal > 0),
  protein_goal numeric NOT NULL CHECK (protein_goal > 0)
);

COMMENT ON TABLE public.users IS
  'App users with daily macro targets for meal planning.';
COMMENT ON COLUMN public.users.calorie_goal IS 'Daily calorie target';
COMMENT ON COLUMN public.users.protein_goal IS 'Daily protein target';

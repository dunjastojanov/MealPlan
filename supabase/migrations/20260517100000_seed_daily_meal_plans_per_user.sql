-- Seed seven empty daily meal plans (one per weekday) for each household member.

CREATE OR REPLACE FUNCTION public.seed_daily_meal_plans_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.daily_meal_plans (user_id, day_of_week)
  SELECT p_user_id, d.day_of_week
  FROM (
    VALUES
      ('monday'::public.day_of_week),
      ('tuesday'::public.day_of_week),
      ('wednesday'::public.day_of_week),
      ('thursday'::public.day_of_week),
      ('friday'::public.day_of_week),
      ('saturday'::public.day_of_week),
      ('sunday'::public.day_of_week)
  ) AS d(day_of_week)
  ON CONFLICT (user_id, day_of_week) DO NOTHING;
END;
$$;

SELECT public.seed_daily_meal_plans_for_user(u.id)
FROM public.users u;

CREATE OR REPLACE FUNCTION public.handle_new_public_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_daily_meal_plans_for_user(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_public_user_created ON public.users;
CREATE TRIGGER on_public_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_public_user();

CREATE OR REPLACE FUNCTION public.prevent_daily_meal_plan_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Daily meal plans cannot be deleted; clear meals instead.';
END;
$$;

DROP TRIGGER IF EXISTS prevent_daily_meal_plan_delete ON public.daily_meal_plans;
CREATE TRIGGER prevent_daily_meal_plan_delete
  BEFORE DELETE ON public.daily_meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_daily_meal_plan_delete();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calorie numeric;
  protein numeric;
BEGIN
  calorie := (NEW.raw_user_meta_data->>'calorie_goal')::numeric;
  protein := (NEW.raw_user_meta_data->>'protein_goal')::numeric;

  IF NEW.raw_user_meta_data->>'first_name' IS NULL
     OR NEW.raw_user_meta_data->>'last_name' IS NULL
     OR calorie IS NULL
     OR calorie <= 0
     OR protein IS NULL
     OR protein <= 0 THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.users (id, first_name, last_name, calorie_goal, protein_goal)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    calorie,
    protein
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

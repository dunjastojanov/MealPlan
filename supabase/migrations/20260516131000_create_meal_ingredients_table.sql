CREATE TABLE public.meal_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  amount numeric NOT NULL CHECK (amount > 0)
);

CREATE INDEX meal_ingredients_meal_id_idx ON public.meal_ingredients (meal_id);
CREATE INDEX meal_ingredients_ingredient_id_idx ON public.meal_ingredients (ingredient_id);

COMMENT ON COLUMN public.meal_ingredients.amount IS
  'Quantity in the parent ingredient''s unit: grams when unit is g, pieces when unit is piece.';

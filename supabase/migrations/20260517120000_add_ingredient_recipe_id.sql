ALTER TABLE public.ingredients
  ADD COLUMN recipe_id uuid
  REFERENCES public.meals(id) ON DELETE SET NULL;

CREATE INDEX ingredients_recipe_id_idx ON public.ingredients(recipe_id);

COMMENT ON COLUMN public.ingredients.recipe_id IS
  'Optional link to a meal recipe when ingredient type is Napravljeno.';

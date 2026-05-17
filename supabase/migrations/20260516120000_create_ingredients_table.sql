-- Macro basis: per 1 g when unit = 'g', per 1 piece when unit = 'piece'
CREATE TYPE public.ingredient_unit AS ENUM ('g', 'piece');

CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  calories numeric NOT NULL,
  protein numeric NOT NULL,
  unit public.ingredient_unit NOT NULL
);

COMMENT ON TABLE public.ingredients IS
  'Ingredient catalog. calories and protein interpretation depends on unit.';
COMMENT ON COLUMN public.ingredients.calories IS
  'Per 1 g when unit is g; per 1 piece when unit is piece.';
COMMENT ON COLUMN public.ingredients.protein IS
  'Per 1 g when unit is g; per 1 piece when unit is piece.';

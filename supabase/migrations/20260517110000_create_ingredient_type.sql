CREATE TABLE public.ingredient_type (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE CHECK (number > 0),
  name text NOT NULL UNIQUE
);

INSERT INTO public.ingredient_type (number, name)
VALUES
  (1, 'Orašasti plodovi'),
  (2, 'Voće i povrće'),
  (3, 'Tegle i konzerve'),
  (4, 'Pecivo'),
  (5, 'Slatkiši'),
  (6, 'Meso'),
  (7, 'Suhomesnati proizvodi'),
  (8, 'Sirevi'),
  (9, 'Mlečni proizvodi'),
  (10, 'Osnovne namirnice'),
  (11, 'Smrznuti proizvodi'),
  (12, 'Grickalice'),
  (13, 'Piće'),
  (14, 'Napravljeno');

ALTER TABLE public.ingredients
  ADD COLUMN ingredient_type_id uuid
  REFERENCES public.ingredient_type(id) ON DELETE RESTRICT;

CREATE INDEX ingredients_ingredient_type_id_idx ON public.ingredients(ingredient_type_id);

ALTER TABLE public.ingredient_type ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access"
  ON public.ingredient_type
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

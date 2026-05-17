-- Add nullable preparation to meals and seed catalog from meals.json.
-- ingredient_id slugs map to ingredients.name from 20260516180000_seed_ingredients.sql.
-- Tortilja meal line uses amount 1 (piece); ingredient row already unit = piece.

ALTER TABLE public.meals
  ADD COLUMN preparation text;

COMMENT ON COLUMN public.meals.preparation IS
  'Recipe steps / instructions; NULL when not provided.';

INSERT INTO public.meals (name, preparation)
VALUES
  (
    'Džem od jagoda',
    'Izgnječiti jagode, dodati chia semenke, limunov sok i eritritol. Ostaviti 30 min da se zgusne.'
  ),
  (
    'Integralne palačinke',
    'Pomešati sastojke, peći na tiganju uz minimalno ulja. Servirati sa džemom.'
  ),
  (
    'Ovsena kaša',
    'Skuvati ovsene sa mlekom, dodati lan i džem.'
  ),
  (
    'Sendvič',
    'Složiti sastojke između hleba.'
  ),
  (
    'Testenina sa piletinom',
    'Skuvati testeninu. Piletinu propržiti, dodati spanać i sir, pa pomešati.'
  ),
  (
    'Bolonjeze',
    'Dinstati luk i šargarepu, dodati meso i paradajz. Poslužiti sa testeninom.'
  ),
  (
    'Tortilja',
    'Zagrejati tortilju i napuniti sastojcima.'
  ),
  (
    'Salata',
    'Pomešati sve sastojke i začiniti.'
  ),
  (
    'Bruskete sa tunjevinom',
    'Istostirati hleb i dodati tunjevinu, masline i paradajz.'
  ),
  (
    'Pasulj sa kobasicom',
    'Skuvati pasulj sa povrćem, dodati kobasicu pred kraj.'
  ),
  (
    'Burrito bowl',
    'Skuvati pirinač, ispeći meso i pomešati sa povrćem i pasuljem. Dodati sir.'
  ),
  (
    'Stir-fry',
    'Ispeći meso, dodati povrće, zatim nudle i soja sos. Kratko propržiti.'
  );

WITH ingredient_slug AS (
  SELECT slug, ingredient_name
  FROM (VALUES
    ('strawberry', 'Jagode'),
    ('chia_seeds', 'Chia Semenke'),
    ('lemon_juice', 'Limunov Sok'),
    ('erythritol', 'Eritritol'),
    ('whole_wheat_flour', 'Integralno Brašno'),
    ('egg', 'Jaja'),
    ('oil', 'Ulje'),
    ('oats', 'Ovsene Pahuljice'),
    ('flaxseed', 'Lan'),
    ('almond_milk', 'Bademovo Mleko'),
    ('bread', 'Integralni Hleb'),
    ('chicken_breast', 'Pileća Prsa'),
    ('turkey_breast', 'Ćureća Prsa'),
    ('hummus', 'Humus'),
    ('lettuce', 'Zelena Salata'),
    ('tomato', 'Paradajz'),
    ('cucumber', 'Krastavac'),
    ('pasta', 'Testenina'),
    ('spinach', 'Spanać'),
    ('cheese', 'Sir'),
    ('cooking_cream', 'Pavlaka Za Kuvanje'),
    ('beef_minced', 'Mlevena Junetina'),
    ('onion', 'Luk'),
    ('carrot', 'Šargarepa'),
    ('parmesan', 'Parmezan'),
    ('tortilla', 'Tortilja'),
    ('olives', 'Masline'),
    ('apple', 'Jabuka'),
    ('olive_oil', 'Maslinovo Ulje'),
    ('tuna', 'Tunjevina'),
    ('beans_white', 'Beli Pasulj'),
    ('beans_red', 'Crveni Pasulj'),
    ('sausage', 'Kobasica'),
    ('rice', 'Pirinač'),
    ('bell_pepper', 'Paprika'),
    ('rice_noodles', 'Pirinčane Nudle'),
    ('cabbage', 'Kupus'),
    ('mushrooms', 'Pečurke'),
    ('soy_sauce', 'Soja Sos'),
    ('garlic', 'Beli Luk')
  ) AS m(slug, ingredient_name)
)
INSERT INTO public.meal_ingredients (meal_id, ingredient_id, amount)
SELECT
  m.id,
  i.id,
  CASE WHEN s.slug = 'tortilla' THEN 1 ELSE li.amount_g END
FROM (VALUES
  ('Džem od jagoda', 'strawberry', 250),
  ('Džem od jagoda', 'chia_seeds', 10),
  ('Džem od jagoda', 'lemon_juice', 10),
  ('Džem od jagoda', 'erythritol', 5),
  ('Integralne palačinke', 'whole_wheat_flour', 100),
  ('Integralne palačinke', 'egg', 100),
  ('Integralne palačinke', 'oil', 5),
  ('Integralne palačinke', 'strawberry', 30),
  ('Ovsena kaša', 'oats', 50),
  ('Ovsena kaša', 'flaxseed', 10),
  ('Ovsena kaša', 'almond_milk', 200),
  ('Ovsena kaša', 'strawberry', 30),
  ('Sendvič', 'bread', 80),
  ('Sendvič', 'chicken_breast', 100),
  ('Sendvič', 'hummus', 30),
  ('Sendvič', 'lettuce', 50),
  ('Sendvič', 'tomato', 50),
  ('Sendvič', 'cucumber', 50),
  ('Testenina sa piletinom', 'pasta', 80),
  ('Testenina sa piletinom', 'chicken_breast', 120),
  ('Testenina sa piletinom', 'spinach', 100),
  ('Testenina sa piletinom', 'cheese', 20),
  ('Bolonjeze', 'pasta', 80),
  ('Bolonjeze', 'beef_minced', 100),
  ('Bolonjeze', 'onion', 50),
  ('Bolonjeze', 'carrot', 50),
  ('Bolonjeze', 'tomato', 150),
  ('Bolonjeze', 'parmesan', 20),
  ('Tortilja', 'tortilla', 60),
  ('Tortilja', 'chicken_breast', 100),
  ('Tortilja', 'hummus', 30),
  ('Tortilja', 'lettuce', 50),
  ('Salata', 'chicken_breast', 100),
  ('Salata', 'lettuce', 100),
  ('Salata', 'tomato', 100),
  ('Salata', 'olives', 30),
  ('Salata', 'apple', 100),
  ('Salata', 'olive_oil', 10),
  ('Bruskete sa tunjevinom', 'bread', 80),
  ('Bruskete sa tunjevinom', 'tuna', 120),
  ('Bruskete sa tunjevinom', 'olives', 30),
  ('Bruskete sa tunjevinom', 'tomato', 100),
  ('Pasulj sa kobasicom', 'beans_white', 150),
  ('Pasulj sa kobasicom', 'sausage', 100),
  ('Pasulj sa kobasicom', 'onion', 50),
  ('Pasulj sa kobasicom', 'carrot', 50),
  ('Pasulj sa kobasicom', 'bread', 50),
  ('Burrito bowl', 'rice', 50),
  ('Burrito bowl', 'beef_minced', 80),
  ('Burrito bowl', 'beans_red', 70),
  ('Burrito bowl', 'bell_pepper', 100),
  ('Burrito bowl', 'cheese', 20),
  ('Stir-fry', 'rice_noodles', 45),
  ('Stir-fry', 'beef_minced', 100),
  ('Stir-fry', 'cabbage', 120),
  ('Stir-fry', 'carrot', 50),
  ('Stir-fry', 'mushrooms', 100),
  ('Stir-fry', 'soy_sauce', 15),
  ('Stir-fry', 'oil', 5),
  ('Stir-fry', 'garlic', 5)
) AS li(meal_name, slug, amount_g)
JOIN public.meals m ON m.name = li.meal_name
JOIN ingredient_slug s ON s.slug = li.slug
JOIN public.ingredients i ON i.name = s.ingredient_name;

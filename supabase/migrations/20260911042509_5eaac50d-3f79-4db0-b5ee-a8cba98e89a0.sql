CREATE TABLE public.favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_currency text NOT NULL,
  target_currency text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_currency, target_currency)
);

GRANT SELECT, INSERT, DELETE ON public.favorites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view favorites" ON public.favorites FOR SELECT USING (true);
CREATE POLICY "Anyone can add favorites" ON public.favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete favorites" ON public.favorites FOR DELETE USING (true);

CREATE TABLE public.conversion_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_currency text NOT NULL,
  target_currency text NOT NULL,
  source_amount numeric NOT NULL,
  converted_amount numeric NOT NULL,
  rate numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.conversion_history TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversion_history TO authenticated;
GRANT ALL ON public.conversion_history TO service_role;
ALTER TABLE public.conversion_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view conversion history" ON public.conversion_history FOR SELECT USING (true);
CREATE POLICY "Anyone can add conversion history" ON public.conversion_history FOR INSERT WITH CHECK (true);

CREATE INDEX conversion_history_created_at_idx ON public.conversion_history (created_at DESC);
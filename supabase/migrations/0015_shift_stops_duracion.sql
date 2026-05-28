-- Add duracion_min to shift_stops to record how long a stop lasted
ALTER TABLE public.shift_stops
  ADD COLUMN duracion_min INTEGER;

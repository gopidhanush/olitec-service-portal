-- OLITEC database performance hardening
-- Applied to production Supabase on 2026-09-26.

-- Cover foreign-key lookups used by joins and deletes.
CREATE INDEX IF NOT EXISTS installations_registration_id_idx
  ON public.installations (registration_id);

CREATE INDEX IF NOT EXISTS products_model_id_idx
  ON public.products (model_id);

-- Remove exact duplicate indexes reported by Supabase Security/Performance Advisor.
DROP INDEX IF EXISTS public.notification_events_pending_idx;
DROP INDEX IF EXISTS public.warranty_registrations_registration_number_idx;

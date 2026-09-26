-- OLITEC security hardening
-- Keep customer/admin data behind controlled RPCs and RLS.
-- Public customer flows should use only the explicitly granted verification/registration functions.

-- Core application tables are not directly exposed through the Supabase Data API.
-- SECURITY DEFINER RPCs remain responsible for the small set of operations the portal needs.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'service_admins',
    'product_models',
    'products',
    'warranty_registrations',
    'service_complaints',
    'product_serial_batches',
    'notification_events',
    'notification_settings'
  ] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('revoke all on table public.%I from anon, authenticated', table_name);
    end if;
  end loop;
end $$;

-- Customer invoice uploads are write-only from the customer portal.
-- Do not allow arbitrary object paths to be used as a storage sink.
drop policy if exists "OLITEC public invoice upload" on storage.objects;
create policy "OLITEC public invoice upload"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'invoices'
  and name ~ '^[A-Za-z0-9_-]{6,80}/[0-9a-fA-F-]{36}-[A-Za-z0-9._-]{1,120}$'
);

-- Customers must never be able to enumerate or directly read private invoices.
drop policy if exists "OLITEC public invoice read" on storage.objects;
drop policy if exists "OLITEC public invoice update" on storage.objects;
drop policy if exists "OLITEC public invoice delete" on storage.objects;

-- Product images are intentionally public, but uploads/changes remain admin-only.
-- Keep the existing product-image read policy and deny anonymous writes.
drop policy if exists "OLITEC public product image upload" on storage.objects;
drop policy if exists "OLITEC public product image update" on storage.objects;
drop policy if exists "OLITEC public product image delete" on storage.objects;

-- Prevent accidental direct execution of this migration helper by API roles.
-- All application functions should explicitly grant only anon/authenticated access where required.

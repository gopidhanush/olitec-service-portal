-- OLITEC security hardening

-- Sensitive application tables are never directly exposed through the Data API.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'customers','installations','registrations','service_admins','product_models','products',
    'warranty_registrations','warranties','service_complaints','service_complaint_feedback',
    'product_serial_batches','notification_events','notification_settings'
  ] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('revoke all on table public.%I from anon, authenticated', table_name);
    end if;
  end loop;
end $$;

-- Remove API execution rights from every SECURITY DEFINER function first.
-- Explicit grants are restored below only for functions used by the application.
do $$
declare
  r record;
begin
  for r in
    select n.nspname as schema_name, p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef = true
  loop
    execute format('revoke execute on function %I.%I(%s) from anon, authenticated', r.schema_name, r.proname, r.args);
  end loop;
end $$;

-- Customer-facing RPCs. These intentionally remain callable without login.
grant execute on function public.get_product_for_registration(text) to anon, authenticated;
grant execute on function public.get_warranty_verification(text) to anon, authenticated;
grant execute on function public.get_service_context(text) to anon, authenticated;
grant execute on function public.create_service_complaint(text, jsonb) to anon, authenticated;
grant execute on function public.register_product_purchase(text, jsonb) to anon, authenticated;
grant execute on function public.get_complaint_tracking(text) to anon, authenticated;
grant execute on function public.get_complaint_feedback(text) to anon, authenticated;
grant execute on function public.submit_complaint_feedback(text, text, integer, text) to anon, authenticated;

-- Administration RPCs require a signed-in account. Each function still performs
-- its own module/super-admin authorization check inside the database.
grant execute on function public.get_admin_permissions() to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_set_user_permissions(text, boolean, boolean, boolean) to authenticated;
grant execute on function public.admin_get_product_catalog() to authenticated;
grant execute on function public.admin_create_product_model(text, text, numeric, numeric, integer, text) to authenticated;
grant execute on function public.admin_generate_serial_batch(uuid, date, integer, uuid) to authenticated;
grant execute on function public.admin_mark_serial_batch_downloaded(text) to authenticated;
grant execute on function public.admin_get_serial_batch_for_redownload(text) to authenticated;
grant execute on function public.admin_get_product_batches() to authenticated;
grant execute on function public.admin_get_product_registration_history(text, integer, integer) to authenticated;
grant execute on function public.get_service_admin_complaints() to authenticated;
grant execute on function public.get_service_registration_details(text) to authenticated;
grant execute on function public.update_service_complaint_status(text, text, text, text, text) to authenticated;

-- Trigger/helper functions must never be callable through the public Data API.
-- They are invoked internally by database triggers or other SECURITY DEFINER code.
revoke execute on function public.queue_olitec_notification() from anon, authenticated;
revoke execute on function public.handle_new_admin_auth_user() from anon, authenticated;
revoke execute on function public.ol_admin_allowed() from anon, authenticated;
revoke execute on function public.ol_product_admin_allowed() from anon, authenticated;
revoke execute on function public.ol_service_admin_allowed() from anon, authenticated;
revoke execute on function public.ol_super_admin_allowed() from anon, authenticated;
revoke execute on function public.create_product_registration_notification() from anon, authenticated;
revoke execute on function public.create_complaint_notification() from anon, authenticated;
revoke execute on function public.create_complaint_closed_notification() from anon, authenticated;

-- Customer invoice uploads remain private and write-only from the customer portal.
drop policy if exists "OLITEC public invoice upload" on storage.objects;
create policy "OLITEC public invoice upload"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'invoices'
  and name ~ '^[A-Za-z0-9_-]{6,80}/[0-9a-fA-F-]{36}-[A-Za-z0-9._-]{1,120}$'
);

drop policy if exists "OLITEC public invoice read" on storage.objects;
drop policy if exists "OLITEC public invoice update" on storage.objects;
drop policy if exists "OLITEC public invoice delete" on storage.objects;

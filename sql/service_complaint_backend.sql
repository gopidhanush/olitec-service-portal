-- OLITEC customer service complaint / warranty lookup backend
-- Customers can use a registration number or product serial number.
-- A serial number with an open complaint cannot receive another complaint until closed.

create or replace function public.get_warranty_verification(p_registration_number text)
returns table (registration_number text, serial_number text, model_code text, product_name text, capacity_kw numeric,
  warranty_months integer, warranty_start_date date, warranty_end_date date, status text)
language sql security definer set search_path = public
as $$
  select wr.registration_number, wr.serial_number, wr.model_code, wr.product_name, wr.capacity_kw,
         wr.warranty_months, wr.warranty_start_date, wr.warranty_end_date, wr.status
  from public.warranty_registrations wr
  where (upper(trim(wr.registration_number)) = upper(trim(p_registration_number))
      or upper(trim(wr.serial_number)) = upper(trim(p_registration_number)))
    and wr.status <> 'cancelled'
  order by wr.serial_number;
$$;
revoke all on function public.get_warranty_verification(text) from public;
grant execute on function public.get_warranty_verification(text) to anon, authenticated;

-- Run sql/complaint_serial_guard.sql after this file in an existing database.
-- It recreates get_service_context with complaint status and adds the server-side
-- active-complaint guard to create_service_complaint.

create or replace function public.get_complaint_tracking(p_complaint_number text)
returns table (
  complaint_number text, registration_number text, serial_number text, model_code text, product_name text,
  complaint_type text, problem_description text, status text, preferred_visit_date date,
  preferred_contact_time text, service_city text, service_state text, created_at timestamptz
)
language sql security definer set search_path = public
as $$
  select sc.complaint_number, sc.registration_number, sc.serial_number, sc.model_code, sc.product_name,
         sc.complaint_type, sc.problem_description, sc.status, sc.preferred_visit_date,
         sc.preferred_contact_time, sc.service_city, sc.service_state, sc.created_at
  from public.service_complaints sc
  where (upper(trim(sc.complaint_number)) = upper(trim(p_complaint_number))
      or upper(trim(coalesce(sc.registration_number,''))) = upper(trim(p_complaint_number))
      or upper(trim(sc.serial_number)) = upper(trim(p_complaint_number)))
    and sc.status <> 'cancelled'
  order by sc.created_at desc
  limit 1;
$$;
revoke all on function public.get_complaint_tracking(text) from public;
grant execute on function public.get_complaint_tracking(text) to anon, authenticated;

-- OLITEC security hardening
-- Applied to the production Supabase project on 2026-09-26.
--
-- Goals:
--   1. Keep customer-facing service lookup free of customer PII.
--   2. Prevent a complaint request from binding a serial number to a different registration.
--   3. Keep customer-facing RPCs behind explicit EXECUTE grants.
--   4. Limit complaint description size to reduce abuse and accidental oversized payloads.

CREATE OR REPLACE FUNCTION public.get_service_context(p_registration_number text)
RETURNS TABLE (
  registration_number text,
  serial_number text,
  model_code text,
  product_name text,
  capacity_kw numeric,
  full_name text,
  mobile text,
  email text,
  address text,
  city text,
  state text,
  pin_code text,
  purchase_date date,
  warranty_start_date date,
  warranty_end_date date,
  warranty_status text,
  complaint_number text,
  complaint_status text,
  complaint_created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    wr.registration_number,
    wr.serial_number,
    wr.model_code,
    wr.product_name,
    wr.capacity_kw,
    NULL::text AS full_name,
    NULL::text AS mobile,
    NULL::text AS email,
    NULL::text AS address,
    NULL::text AS city,
    NULL::text AS state,
    NULL::text AS pin_code,
    NULL::date AS purchase_date,
    wr.warranty_start_date,
    wr.warranty_end_date,
    wr.status AS warranty_status,
    active_complaint.complaint_number,
    active_complaint.status AS complaint_status,
    active_complaint.created_at AS complaint_created_at
  FROM public.warranty_registrations wr
  LEFT JOIN LATERAL (
    SELECT sc.complaint_number, sc.status, sc.created_at
    FROM public.service_complaints sc
    WHERE upper(trim(sc.serial_number)) = upper(trim(wr.serial_number))
      AND sc.status <> 'cancelled'
    ORDER BY
      CASE WHEN lower(trim(sc.status)) <> 'closed' THEN 0 ELSE 1 END,
      sc.created_at DESC
    LIMIT 1
  ) active_complaint ON true
  WHERE (
      upper(trim(wr.registration_number)) = upper(trim(p_registration_number))
      OR upper(trim(wr.serial_number)) = upper(trim(p_registration_number))
    )
    AND wr.status <> 'cancelled'
  ORDER BY wr.serial_number;
$$;

REVOKE ALL ON FUNCTION public.get_service_context(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_service_context(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_service_complaint(
  p_registration_number text,
  p_complaint jsonb
)
RETURNS TABLE (
  complaint_number text,
  registration_number text,
  serial_number text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
declare
  v_registration public.warranty_registrations%rowtype;
  v_requested_serial text := nullif(upper(trim(p_complaint->>'serial_number')), '');
  v_complaint_number text;
  v_id bigint;
  v_existing public.service_complaints%rowtype;
begin
  if v_requested_serial is not null then
    select wr.* into v_registration
    from public.warranty_registrations wr
    where upper(trim(wr.serial_number)) = v_requested_serial
      and wr.status <> 'cancelled'
      and (
        upper(trim(wr.registration_number)) = upper(trim(p_registration_number))
        or upper(trim(wr.serial_number)) = upper(trim(p_registration_number))
      )
    limit 1;
  else
    select wr.* into v_registration
    from public.warranty_registrations wr
    where (
        upper(trim(wr.registration_number)) = upper(trim(p_registration_number))
        or upper(trim(wr.serial_number)) = upper(trim(p_registration_number))
      )
      and wr.status <> 'cancelled'
    order by wr.serial_number
    limit 1;
  end if;

  if v_registration.id is null then
    raise exception 'REGISTRATION_NOT_FOUND';
  end if;

  if nullif(p_complaint->>'complaint_type', '') is null then
    raise exception 'COMPLAINT_TYPE_REQUIRED';
  end if;

  if nullif(p_complaint->>'problem_description', '') is null then
    raise exception 'PROBLEM_DESCRIPTION_REQUIRED';
  end if;

  if length(p_complaint->>'problem_description') > 4000 then
    raise exception 'PROBLEM_DESCRIPTION_TOO_LONG';
  end if;

  select sc.* into v_existing
  from public.service_complaints sc
  where upper(trim(sc.serial_number)) = upper(trim(v_registration.serial_number))
    and lower(trim(coalesce(sc.status, ''))) not in ('closed', 'cancelled')
  order by sc.created_at desc
  limit 1;

  if v_existing.id is not null then
    raise exception 'COMPLAINT_ALREADY_OPEN:%:%:%',
      v_existing.complaint_number,
      v_existing.status,
      v_registration.serial_number;
  end if;

  select
    'OLC-' || to_char(current_date, 'YYYY') || '-' ||
    lpad((coalesce(max(sc.id), 0) + 1)::text, 6, '0')
  into v_complaint_number
  from public.service_complaints sc;

  insert into public.service_complaints (
    complaint_number, registration_number, serial_number, model_code, product_name,
    full_name, mobile, email, address, city, state, pin_code,
    complaint_type, problem_description, purchase_date,
    preferred_visit_date, preferred_contact_time,
    service_address, service_city, service_state, service_pin, status
  ) values (
    v_complaint_number, v_registration.registration_number, v_registration.serial_number,
    v_registration.model_code, v_registration.product_name,
    v_registration.full_name, v_registration.mobile, v_registration.email,
    v_registration.address, v_registration.city, v_registration.state, v_registration.pin_code,
    p_complaint->>'complaint_type', p_complaint->>'problem_description', v_registration.purchase_date,
    nullif(p_complaint->>'preferred_visit_date', '')::date,
    nullif(p_complaint->>'preferred_contact_time', ''),
    coalesce(nullif(p_complaint->>'service_address', ''), v_registration.address),
    coalesce(nullif(p_complaint->>'service_city', ''), v_registration.city),
    coalesce(nullif(p_complaint->>'service_state', ''), v_registration.state),
    coalesce(nullif(p_complaint->>'service_pin', ''), v_registration.pin_code),
    'received'
  ) returning id into v_id;

  return query
  select sc.complaint_number, sc.registration_number, sc.serial_number, sc.status
  from public.service_complaints sc
  where sc.id = v_id;
exception
  when unique_violation then
    raise exception 'COMPLAINT_CONFLICT';
end;
$$;

REVOKE ALL ON FUNCTION public.create_service_complaint(text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.create_service_complaint(text, jsonb) TO anon, authenticated;

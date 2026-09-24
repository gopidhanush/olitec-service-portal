-- OLITEC service complaint serial guard
-- A serial number may have only one active complaint at a time.
-- A new complaint becomes available again only after the previous complaint is closed.

DROP FUNCTION IF EXISTS public.get_service_context(text);

CREATE FUNCTION public.get_service_context(p_registration_number text)
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
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    wr.registration_number,
    wr.serial_number,
    wr.model_code,
    wr.product_name,
    wr.capacity_kw,
    wr.full_name,
    wr.mobile,
    wr.email,
    wr.address,
    wr.city,
    wr.state,
    wr.pin_code,
    wr.purchase_date,
    wr.warranty_start_date,
    wr.warranty_end_date,
    wr.status,
    active_complaint.complaint_number,
    active_complaint.status,
    active_complaint.created_at
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
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
declare
  v_registration public.warranty_registrations%rowtype;
  v_requested_serial text := NULLIF(UPPER(TRIM(p_complaint->>'serial_number')), '');
  v_complaint_number text;
  v_id bigint;
  v_existing public.service_complaints%rowtype;
begin
  IF v_requested_serial IS NOT NULL THEN
    SELECT wr.* INTO v_registration
    FROM public.warranty_registrations wr
    WHERE upper(trim(wr.serial_number)) = v_requested_serial
      AND upper(trim(wr.registration_number)) = upper(trim(p_registration_number))
      AND wr.status <> 'cancelled'
    LIMIT 1;

    IF v_registration.id IS NULL THEN
      SELECT wr.* INTO v_registration
      FROM public.warranty_registrations wr
      WHERE upper(trim(wr.serial_number)) = v_requested_serial
        AND wr.status <> 'cancelled'
      LIMIT 1;
    END IF;
  ELSE
    SELECT wr.* INTO v_registration
    FROM public.warranty_registrations wr
    WHERE (
        upper(trim(wr.registration_number)) = upper(trim(p_registration_number))
        OR upper(trim(wr.serial_number)) = upper(trim(p_registration_number))
      )
      AND wr.status <> 'cancelled'
    ORDER BY wr.serial_number
    LIMIT 1;
  END IF;

  IF v_registration.id IS NULL THEN
    RAISE EXCEPTION 'REGISTRATION_NOT_FOUND';
  END IF;

  IF NULLIF(p_complaint->>'complaint_type', '') IS NULL THEN
    RAISE EXCEPTION 'COMPLAINT_TYPE_REQUIRED';
  END IF;

  IF NULLIF(p_complaint->>'problem_description', '') IS NULL THEN
    RAISE EXCEPTION 'PROBLEM_DESCRIPTION_REQUIRED';
  END IF;

  SELECT sc.* INTO v_existing
  FROM public.service_complaints sc
  WHERE upper(trim(sc.serial_number)) = upper(trim(v_registration.serial_number))
    AND lower(trim(coalesce(sc.status, ''))) NOT IN ('closed', 'cancelled')
  ORDER BY sc.created_at DESC
  LIMIT 1;

  IF v_existing.id IS NOT NULL THEN
    RAISE EXCEPTION 'COMPLAINT_ALREADY_OPEN:%:%:%',
      v_existing.complaint_number,
      v_existing.status,
      v_registration.serial_number;
  END IF;

  SELECT
    'OLC-' || to_char(current_date, 'YYYY') || '-' ||
    lpad((coalesce(max(sc.id), 0) + 1)::text, 6, '0')
  INTO v_complaint_number
  FROM public.service_complaints sc;

  INSERT INTO public.service_complaints (
    complaint_number,
    registration_number,
    serial_number,
    model_code,
    product_name,
    full_name,
    mobile,
    email,
    address,
    city,
    state,
    pin_code,
    complaint_type,
    problem_description,
    purchase_date,
    preferred_visit_date,
    preferred_contact_time,
    service_address,
    service_city,
    service_state,
    service_pin,
    status
  ) VALUES (
    v_complaint_number,
    v_registration.registration_number,
    v_registration.serial_number,
    v_registration.model_code,
    v_registration.product_name,
    v_registration.full_name,
    v_registration.mobile,
    v_registration.email,
    v_registration.address,
    v_registration.city,
    v_registration.state,
    v_registration.pin_code,
    p_complaint->>'complaint_type',
    p_complaint->>'problem_description',
    v_registration.purchase_date,
    nullif(p_complaint->>'preferred_visit_date', '')::date,
    nullif(p_complaint->>'preferred_contact_time', ''),
    coalesce(nullif(p_complaint->>'service_address', ''), v_registration.address),
    coalesce(nullif(p_complaint->>'service_city', ''), v_registration.city),
    coalesce(nullif(p_complaint->>'service_state', ''), v_registration.state),
    coalesce(nullif(p_complaint->>'service_pin', ''), v_registration.pin_code),
    'received'
  ) RETURNING id INTO v_id;

  RETURN QUERY
  SELECT sc.complaint_number, sc.registration_number, sc.serial_number, sc.status
  FROM public.service_complaints sc
  WHERE sc.id = v_id;

EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'COMPLAINT_CONFLICT';
END;
$$;

REVOKE ALL ON FUNCTION public.create_service_complaint(text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.create_service_complaint(text, jsonb) TO anon, authenticated;

-- OLITEC multi-product registration migration
-- A single registration number can own multiple inverter serial numbers.
-- Run this once in the Supabase SQL Editor before using the multi-product flow.

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.warranty_registrations'::regclass
    AND contype = 'u'
    AND pg_get_constraintdef(oid) LIKE '%(registration_number)%'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.warranty_registrations DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS warranty_registrations_registration_number_idx
  ON public.warranty_registrations (registration_number);

CREATE SEQUENCE IF NOT EXISTS public.warranty_registration_number_seq;
SELECT setval(
  'public.warranty_registration_number_seq',
  GREATEST(COALESCE((SELECT MAX(id) FROM public.warranty_registrations), 0), 1),
  true
);

-- Return every device under a registration, or the single device when a serial is supplied.
CREATE OR REPLACE FUNCTION public.get_warranty_verification(p_registration_number text)
RETURNS TABLE (
  registration_number text,
  serial_number text,
  model_code text,
  product_name text,
  capacity_kw numeric,
  warranty_months integer,
  warranty_start_date date,
  warranty_end_date date,
  status text
)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT wr.registration_number, wr.serial_number, wr.model_code, wr.product_name, wr.capacity_kw,
         wr.warranty_months, wr.warranty_start_date, wr.warranty_end_date, wr.status
  FROM public.warranty_registrations wr
  WHERE (
      UPPER(TRIM(wr.registration_number)) = UPPER(TRIM(p_registration_number))
      OR UPPER(TRIM(wr.serial_number)) = UPPER(TRIM(p_registration_number))
    )
    AND wr.status <> 'cancelled'
  ORDER BY wr.serial_number;
$$;
REVOKE ALL ON FUNCTION public.get_warranty_verification(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_warranty_verification(text) TO anon, authenticated;

-- Registration lookup used by warranty/service screens.
CREATE OR REPLACE FUNCTION public.get_registered_products(p_registration_number text)
RETURNS TABLE (
  registration_number text,
  serial_number text,
  model_code text,
  product_name text,
  capacity_kw numeric,
  warranty_months integer,
  warranty_start_date date,
  warranty_end_date date,
  status text
)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT wr.registration_number, wr.serial_number, wr.model_code, wr.product_name, wr.capacity_kw,
         wr.warranty_months, wr.warranty_start_date, wr.warranty_end_date, wr.status
  FROM public.warranty_registrations wr
  WHERE UPPER(TRIM(wr.registration_number)) = UPPER(TRIM(p_registration_number))
    AND wr.status <> 'cancelled'
  ORDER BY wr.serial_number;
$$;
REVOKE ALL ON FUNCTION public.get_registered_products(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_registered_products(text) TO anon, authenticated;

-- Register one or more serial numbers under one registration number.
-- registration.serial_numbers is a JSON array. The old single-identifier behaviour remains supported.
CREATE OR REPLACE FUNCTION public.register_product_purchase(identifier text, registration jsonb)
RETURNS TABLE (
  registration_number text,
  serial_number text,
  model_code text,
  warranty_start_date date,
  warranty_end_date date,
  status text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_serials text[];
  v_serial text;
  v_model_code text;
  v_product_name text;
  v_capacity_kw numeric;
  v_warranty_months integer;
  v_purchase_date date;
  v_registration_number text;
  v_id bigint;
BEGIN
  IF jsonb_typeof(registration->'serial_numbers') = 'array' THEN
    SELECT ARRAY(
      SELECT DISTINCT UPPER(TRIM(value))
      FROM jsonb_array_elements_text(registration->'serial_numbers') AS value
      WHERE TRIM(value) <> ''
    ) INTO v_serials;
  ELSE
    v_serials := ARRAY[UPPER(TRIM(identifier))];
  END IF;

  IF COALESCE(array_length(v_serials, 1), 0) = 0 THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
  END IF;

  v_purchase_date := NULLIF(registration->>'purchase_date','')::date;
  IF v_purchase_date IS NULL THEN RAISE EXCEPTION 'PURCHASE_DATE_REQUIRED'; END IF;

  IF NULLIF(registration->>'full_name','') IS NULL
     OR NULLIF(registration->>'mobile','') IS NULL
     OR NULLIF(registration->>'address','') IS NULL
     OR NULLIF(registration->>'city','') IS NULL
     OR NULLIF(registration->>'state','') IS NULL
     OR NULLIF(registration->>'pin_code','') IS NULL
     OR NULLIF(registration->>'dealer_name','') IS NULL THEN
    RAISE EXCEPTION 'REQUIRED_CUSTOMER_FIELDS_MISSING';
  END IF;

  FOREACH v_serial IN ARRAY v_serials LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.products p
      WHERE UPPER(TRIM(p.serial_number)) = v_serial
         OR UPPER(TRIM(p.qr_code)) = v_serial
    ) THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND:%', v_serial;
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.warranty_registrations wr
      WHERE UPPER(TRIM(wr.serial_number)) = v_serial
        AND wr.status <> 'cancelled'
    ) THEN
      SELECT wr.registration_number INTO v_registration_number
      FROM public.warranty_registrations wr
      WHERE UPPER(TRIM(wr.serial_number)) = v_serial
        AND wr.status <> 'cancelled'
      LIMIT 1;
      RAISE EXCEPTION 'PRODUCT_ALREADY_REGISTERED:%:%', v_serial, v_registration_number;
    END IF;
  END LOOP;

  v_registration_number := 'OLR-' || to_char(current_date, 'YYYY') || '-' ||
    lpad(nextval('public.warranty_registration_number_seq')::text, 6, '0');

  FOREACH v_serial IN ARRAY v_serials LOOP
    SELECT p.serial_number, pm.model_code, pm.product_name, pm.capacity_kw, pm.warranty_months
      INTO v_serial, v_model_code, v_product_name, v_capacity_kw, v_warranty_months
    FROM public.products p
    JOIN public.product_models pm ON pm.id = p.model_id
    WHERE UPPER(TRIM(p.serial_number)) = v_serial
       OR UPPER(TRIM(p.qr_code)) = v_serial
    LIMIT 1;

    INSERT INTO public.warranty_registrations (
      registration_number, serial_number, model_code, product_name, capacity_kw, warranty_months,
      warranty_start_date, warranty_end_date, full_name, mobile, email, address, city, state, pin_code,
      purchase_date, invoice_number, dealer_name, purchase_type, installation_date, installation_type,
      installer_name, installer_mobile, installation_address, installation_city, installation_state, installation_pin,
      invoice_path, status
    ) VALUES (
      v_registration_number, v_serial, v_model_code, v_product_name, v_capacity_kw, v_warranty_months,
      v_purchase_date, (v_purchase_date + make_interval(months => v_warranty_months))::date - 1,
      registration->>'full_name', registration->>'mobile', NULLIF(registration->>'email',''), registration->>'address',
      registration->>'city', registration->>'state', registration->>'pin_code', v_purchase_date,
      NULLIF(registration->>'invoice_number',''), registration->>'dealer_name', registration->>'purchase_type',
      NULLIF(registration->>'installation_date','')::date, registration->>'installation_type',
      NULLIF(registration->>'installer_name',''), NULLIF(registration->>'installer_mobile',''),
      NULLIF(registration->>'installation_address',''), NULLIF(registration->>'installation_city',''),
      NULLIF(registration->>'installation_state',''), NULLIF(registration->>'installation_pin',''),
      NULLIF(registration->>'invoice_path',''), 'active'
    ) RETURNING id INTO v_id;

    RETURN QUERY
      SELECT wr.registration_number, wr.serial_number, wr.model_code,
             wr.warranty_start_date, wr.warranty_end_date, wr.status
      FROM public.warranty_registrations wr
      WHERE wr.id = v_id;
  END LOOP;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'REGISTRATION_CONFLICT';
END;
$$;
REVOKE ALL ON FUNCTION public.register_product_purchase(text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.register_product_purchase(text, jsonb) TO anon, authenticated;

-- Service context returns all devices when a registration number is supplied.
CREATE OR REPLACE FUNCTION public.get_service_context(p_registration_number text)
RETURNS TABLE (
  registration_number text, serial_number text, model_code text, product_name text, capacity_kw numeric,
  full_name text, mobile text, email text, address text, city text, state text, pin_code text,
  purchase_date date, warranty_start_date date, warranty_end_date date, warranty_status text
)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT wr.registration_number, wr.serial_number, wr.model_code, wr.product_name, wr.capacity_kw,
         wr.full_name, wr.mobile, wr.email, wr.address, wr.city, wr.state, wr.pin_code,
         wr.purchase_date, wr.warranty_start_date, wr.warranty_end_date, wr.status
  FROM public.warranty_registrations wr
  WHERE (
      UPPER(TRIM(wr.registration_number)) = UPPER(TRIM(p_registration_number))
      OR UPPER(TRIM(wr.serial_number)) = UPPER(TRIM(p_registration_number))
    )
    AND wr.status <> 'cancelled'
  ORDER BY wr.serial_number;
$$;
REVOKE ALL ON FUNCTION public.get_service_context(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_service_context(text) TO anon, authenticated;

-- When the complaint starts from a registration number, p_complaint.serial_number identifies the faulty device.
CREATE OR REPLACE FUNCTION public.create_service_complaint(p_registration_number text, p_complaint jsonb)
RETURNS TABLE (complaint_number text, registration_number text, serial_number text, status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_registration public.warranty_registrations%rowtype;
  v_requested_serial text := NULLIF(UPPER(TRIM(p_complaint->>'serial_number')), '');
  v_complaint_number text;
  v_id bigint;
BEGIN
  IF v_requested_serial IS NOT NULL THEN
    SELECT wr.* INTO v_registration
    FROM public.warranty_registrations wr
    WHERE UPPER(TRIM(wr.serial_number)) = v_requested_serial
      AND UPPER(TRIM(wr.registration_number)) = UPPER(TRIM(p_registration_number))
      AND wr.status <> 'cancelled'
    LIMIT 1;

    IF v_registration.id IS NULL THEN
      SELECT wr.* INTO v_registration
      FROM public.warranty_registrations wr
      WHERE UPPER(TRIM(wr.serial_number)) = v_requested_serial
        AND wr.status <> 'cancelled'
      LIMIT 1;
    END IF;
  ELSE
    SELECT wr.* INTO v_registration
    FROM public.warranty_registrations wr
    WHERE (
        UPPER(TRIM(wr.registration_number)) = UPPER(TRIM(p_registration_number))
        OR UPPER(TRIM(wr.serial_number)) = UPPER(TRIM(p_registration_number))
      )
      AND wr.status <> 'cancelled'
    ORDER BY wr.serial_number
    LIMIT 1;
  END IF;

  IF v_registration.id IS NULL THEN RAISE EXCEPTION 'REGISTRATION_NOT_FOUND'; END IF;
  IF NULLIF(p_complaint->>'complaint_type','') IS NULL THEN RAISE EXCEPTION 'COMPLAINT_TYPE_REQUIRED'; END IF;
  IF NULLIF(p_complaint->>'problem_description','') IS NULL THEN RAISE EXCEPTION 'PROBLEM_DESCRIPTION_REQUIRED'; END IF;

  SELECT 'OLC-' || to_char(current_date, 'YYYY') || '-' || lpad((coalesce(max(sc.id),0) + 1)::text, 6, '0')
    INTO v_complaint_number FROM public.service_complaints sc;

  INSERT INTO public.service_complaints (
    complaint_number, registration_number, serial_number, model_code, product_name, full_name, mobile, email,
    address, city, state, pin_code, complaint_type, problem_description, purchase_date, preferred_visit_date,
    preferred_contact_time, service_address, service_city, service_state, service_pin, status
  ) VALUES (
    v_complaint_number, v_registration.registration_number, v_registration.serial_number, v_registration.model_code,
    v_registration.product_name, v_registration.full_name, v_registration.mobile, v_registration.email,
    v_registration.address, v_registration.city, v_registration.state, v_registration.pin_code,
    p_complaint->>'complaint_type', p_complaint->>'problem_description', v_registration.purchase_date,
    NULLIF(p_complaint->>'preferred_visit_date','')::date, NULLIF(p_complaint->>'preferred_contact_time',''),
    COALESCE(NULLIF(p_complaint->>'service_address',''), v_registration.address),
    COALESCE(NULLIF(p_complaint->>'service_city',''), v_registration.city),
    COALESCE(NULLIF(p_complaint->>'service_state',''), v_registration.state),
    COALESCE(NULLIF(p_complaint->>'service_pin',''), v_registration.pin_code), 'received'
  ) RETURNING id INTO v_id;

  RETURN QUERY
    SELECT sc.complaint_number, sc.registration_number, sc.serial_number, sc.status
    FROM public.service_complaints sc
    WHERE sc.id = v_id;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'COMPLAINT_CONFLICT';
END;
$$;
REVOKE ALL ON FUNCTION public.create_service_complaint(text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.create_service_complaint(text, jsonb) TO anon, authenticated;

-- Complaint status lookup remains compatible with complaint number, registration number, or serial number.
CREATE OR REPLACE FUNCTION public.get_complaint_tracking(p_complaint_number text)
RETURNS TABLE (
  complaint_number text, registration_number text, serial_number text, model_code text, product_name text,
  complaint_type text, problem_description text, status text, preferred_visit_date date,
  preferred_contact_time text, service_city text, service_state text, created_at timestamptz
)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT sc.complaint_number, sc.registration_number, sc.serial_number, sc.model_code, sc.product_name,
         sc.complaint_type, sc.problem_description, sc.status, sc.preferred_visit_date,
         sc.preferred_contact_time, sc.service_city, sc.service_state, sc.created_at
  FROM public.service_complaints sc
  WHERE (
      UPPER(TRIM(sc.complaint_number)) = UPPER(TRIM(p_complaint_number))
      OR UPPER(TRIM(COALESCE(sc.registration_number,''))) = UPPER(TRIM(p_complaint_number))
      OR UPPER(TRIM(sc.serial_number)) = UPPER(TRIM(p_complaint_number))
    )
    AND sc.status <> 'cancelled'
  ORDER BY sc.created_at DESC
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_complaint_tracking(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_complaint_tracking(text) TO anon, authenticated;

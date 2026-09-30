-- OLITEC QR finalization
-- QR codes now contain a direct customer registration URL instead of only the serial number.
-- The registration lookup still accepts plain serial numbers for backward compatibility.

CREATE OR REPLACE FUNCTION public.get_product_for_registration(identifier text)
RETURNS TABLE (
  product_id uuid,
  serial_number text,
  qr_code text,
  model_code text,
  product_name text,
  capacity_kw numeric,
  manufacturing_date date,
  warranty_months integer,
  product_image text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH input AS (
    SELECT upper(trim(identifier)) AS raw,
           upper(trim(regexp_replace(identifier, '^.*/register/', ''))) AS path_identifier
  )
  SELECT
    p.id,
    p.serial_number,
    p.qr_code,
    pm.model_code,
    pm.product_name,
    pm.capacity_kw,
    p.manufacturing_date,
    pm.warranty_months,
    coalesce(
      nullif(to_jsonb(p)->>'image_url',''),
      nullif(to_jsonb(p)->>'image',''),
      nullif(to_jsonb(p)->>'product_image',''),
      nullif(to_jsonb(p)->>'photo_url',''),
      nullif(to_jsonb(pm)->>'image_url',''),
      nullif(to_jsonb(pm)->>'image',''),
      nullif(to_jsonb(pm)->>'product_image',''),
      nullif(to_jsonb(pm)->>'photo_url','')
    )
  FROM public.products p
  JOIN public.product_models pm ON pm.id = p.model_id
  CROSS JOIN input i
  WHERE upper(trim(p.serial_number)) = i.raw
     OR upper(trim(p.qr_code)) = i.raw
     OR upper(trim(p.serial_number)) = i.path_identifier
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_product_for_registration(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_product_for_registration(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.register_product_purchase(identifier text, registration jsonb)
RETURNS TABLE (registration_number text, serial_number text, model_code text, warranty_start_date date, warranty_end_date date, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_serial text; v_model_code text; v_product_name text; v_capacity_kw numeric; v_warranty_months integer;
  v_purchase_date date; v_registration_number text; v_existing text; v_id bigint;
  v_identifier text := upper(trim(identifier));
  v_path_identifier text := upper(trim(regexp_replace(identifier, '^.*/register/', '')));
BEGIN
  SELECT p.serial_number, pm.model_code, pm.product_name, pm.capacity_kw, pm.warranty_months
    INTO v_serial, v_model_code, v_product_name, v_capacity_kw, v_warranty_months
  FROM public.products p
  JOIN public.product_models pm ON pm.id = p.model_id
  WHERE upper(trim(p.serial_number)) = v_identifier
     OR upper(trim(p.qr_code)) = v_identifier
     OR upper(trim(p.serial_number)) = v_path_identifier
  LIMIT 1;

  IF v_serial IS NULL THEN RAISE EXCEPTION 'PRODUCT_NOT_FOUND'; END IF;

  IF EXISTS (SELECT 1 FROM public.warranty_registrations wr WHERE wr.serial_number = v_serial AND wr.status <> 'cancelled') THEN
    SELECT wr.registration_number INTO v_existing FROM public.warranty_registrations wr
    WHERE wr.serial_number = v_serial AND wr.status <> 'cancelled' LIMIT 1;
    RAISE EXCEPTION 'PRODUCT_ALREADY_REGISTERED:%', v_existing;
  END IF;

  v_purchase_date := nullif(registration->>'purchase_date','')::date;
  IF v_purchase_date IS NULL THEN RAISE EXCEPTION 'PURCHASE_DATE_REQUIRED'; END IF;

  IF nullif(registration->>'full_name','') IS NULL OR nullif(registration->>'mobile','') IS NULL
     OR nullif(registration->>'address','') IS NULL OR nullif(registration->>'city','') IS NULL
     OR nullif(registration->>'state','') IS NULL OR nullif(registration->>'pin_code','') IS NULL
     OR nullif(registration->>'dealer_name','') IS NULL THEN
    RAISE EXCEPTION 'REQUIRED_CUSTOMER_FIELDS_MISSING';
  END IF;

  SELECT 'OLR-' || to_char(current_date, 'YYYY') || '-' || lpad((coalesce(max(id),0) + 1)::text, 6, '0')
    INTO v_registration_number FROM public.warranty_registrations;

  INSERT INTO public.warranty_registrations (
    registration_number, serial_number, model_code, product_name, capacity_kw, warranty_months,
    warranty_start_date, warranty_end_date, full_name, mobile, email, address, city, state, pin_code,
    purchase_date, invoice_number, dealer_name, purchase_type, installation_date, installation_type,
    installer_name, installer_mobile, installation_address, installation_city, installation_state, installation_pin,
    invoice_path, status
  ) VALUES (
    v_registration_number, v_serial, v_model_code, v_product_name, v_capacity_kw, v_warranty_months,
    v_purchase_date, (v_purchase_date + make_interval(months => v_warranty_months))::date - 1,
    registration->>'full_name', registration->>'mobile', nullif(registration->>'email',''), registration->>'address',
    registration->>'city', registration->>'state', registration->>'pin_code', v_purchase_date,
    nullif(registration->>'invoice_number',''), registration->>'dealer_name', registration->>'purchase_type',
    nullif(registration->>'installation_date','')::date, registration->>'installation_type', nullif(registration->>'installer_name',''),
    nullif(registration->>'installer_mobile',''), nullif(registration->>'installation_address',''), nullif(registration->>'installation_city',''),
    nullif(registration->>'installation_state',''), nullif(registration->>'installation_pin',''), nullif(registration->>'invoice_path',''), 'active'
  ) RETURNING id INTO v_id;

  RETURN QUERY SELECT wr.registration_number, wr.serial_number, wr.model_code, wr.warranty_start_date, wr.warranty_end_date, wr.status
  FROM public.warranty_registrations wr WHERE wr.id = v_id;
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'REGISTRATION_CONFLICT';
END;
$$;

REVOKE ALL ON FUNCTION public.register_product_purchase(text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.register_product_purchase(text, jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_generate_serial_batch(p_model_id uuid,p_production_month date,p_quantity integer,p_request_key uuid)
RETURNS TABLE (model_code text,serial_number text,qr_code text,production_month date,batch_number text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_model public.product_models%rowtype;
  v_prefix text; v_month text; v_start bigint; v_batch text; i integer; v_serial text;
  v_qr_url text; v_existing_batch public.product_serial_batches%rowtype;
  v_created_by text:=lower(coalesce(auth.jwt()->>'email','unknown'));
BEGIN
 IF NOT public.ol_admin_allowed() THEN RAISE EXCEPTION 'ADMIN_ACCESS_REQUIRED'; END IF;
 IF p_request_key IS NULL THEN RAISE EXCEPTION 'REQUEST_KEY_REQUIRED'; END IF;
 SELECT * INTO v_existing_batch FROM public.product_serial_batches WHERE request_key=p_request_key LIMIT 1;
 IF v_existing_batch.id IS NOT NULL THEN RAISE EXCEPTION 'BATCH_REQUEST_ALREADY_USED'; END IF;
 SELECT * INTO v_model FROM public.product_models WHERE id=p_model_id AND is_active=true LIMIT 1;
 IF v_model.id IS NULL THEN RAISE EXCEPTION 'PRODUCT_MODEL_NOT_FOUND'; END IF;
 IF p_production_month IS NULL OR extract(day from p_production_month)<>1 THEN RAISE EXCEPTION 'PRODUCTION_MONTH_REQUIRED'; END IF;
 IF coalesce(p_quantity,0)<1 OR p_quantity>10000 THEN RAISE EXCEPTION 'INVALID_QUANTITY'; END IF;
 v_prefix:=regexp_replace(upper(trim(v_model.model_code)),'[^A-Z0-9]','','g');
 v_month:=to_char(p_production_month,'YYMM');
 PERFORM pg_advisory_xact_lock(hashtext(v_prefix||':'||v_month));
 SELECT coalesce(max(nullif(regexp_replace(p.serial_number,'^'||v_prefix||v_month||'',''),'')::bigint),0)+1
   INTO v_start FROM public.products p WHERE p.model_id=v_model.id AND upper(p.serial_number) like v_prefix||v_month||'%';
 v_batch:=v_prefix||'-'||to_char(p_production_month,'YYYYMM')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
 INSERT INTO public.product_serial_batches(batch_number,request_key,model_id,production_month,quantity,created_by)
 VALUES(v_batch,p_request_key,v_model.id,p_production_month,p_quantity,v_created_by);
 FOR i IN 0..p_quantity-1 LOOP
  v_serial:=v_prefix||v_month||lpad((v_start+i)::text,6,'0');
  v_qr_url:='https://olitec-service-portal-weld.vercel.app/register/'||v_serial;
  INSERT INTO public.products(model_id,serial_number,qr_code,manufacturing_date,batch_number,status)
  VALUES(v_model.id,v_serial,v_qr_url,p_production_month,v_batch,'manufactured');
  model_code:=v_model.model_code; serial_number:=v_serial; qr_code:=v_qr_url; production_month:=p_production_month; batch_number:=v_batch; RETURN NEXT;
 END LOOP;
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'SERIAL_NUMBER_CONFLICT';
END;
$$;

REVOKE ALL ON FUNCTION public.admin_generate_serial_batch(uuid,date,integer,uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_generate_serial_batch(uuid,date,integer,uuid) TO authenticated;

-- Convert existing product QR values to direct registration URLs while preserving serial-number lookup compatibility.
UPDATE public.products
SET qr_code = 'https://olitec-service-portal-weld.vercel.app/register/' || upper(trim(serial_number))
WHERE serial_number IS NOT NULL
  AND (qr_code IS NULL OR qr_code = upper(trim(serial_number)) OR qr_code = trim(serial_number));

-- Allow multiple serial-number batches for the same model and production month.
-- Serial numbers remain sequential within each model/month.
-- Example: 000001-000010, then 000011-000020 for the same month.

ALTER TABLE public.product_serial_batches
  DROP CONSTRAINT IF EXISTS product_serial_batches_model_month_unique;

CREATE OR REPLACE FUNCTION public.admin_generate_serial_batch(
  p_model_id uuid,
  p_production_month date,
  p_quantity integer,
  p_request_key uuid
)
RETURNS TABLE (
  model_code text,
  serial_number text,
  qr_code text,
  production_month date,
  batch_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_model public.product_models%rowtype;
  v_prefix text;
  v_month text;
  v_start bigint;
  v_batch text;
  i integer;
  v_serial text;
  v_qr_url text;
  v_existing_batch public.product_serial_batches%rowtype;
  v_created_by text := lower(coalesce(auth.jwt()->>'email','unknown'));
BEGIN
  IF NOT public.ol_admin_allowed() THEN
    RAISE EXCEPTION 'ADMIN_ACCESS_REQUIRED';
  END IF;

  IF p_request_key IS NULL THEN
    RAISE EXCEPTION 'REQUEST_KEY_REQUIRED';
  END IF;

  SELECT *
  INTO v_existing_batch
  FROM public.product_serial_batches
  WHERE request_key = p_request_key
  LIMIT 1;

  IF v_existing_batch.id IS NOT NULL THEN
    RAISE EXCEPTION 'BATCH_REQUEST_ALREADY_USED';
  END IF;

  SELECT *
  INTO v_model
  FROM public.product_models
  WHERE id = p_model_id
    AND is_active = true
  LIMIT 1;

  IF v_model.id IS NULL THEN
    RAISE EXCEPTION 'PRODUCT_MODEL_NOT_FOUND';
  END IF;

  IF p_production_month IS NULL
     OR extract(day FROM p_production_month) <> 1 THEN
    RAISE EXCEPTION 'PRODUCTION_MONTH_REQUIRED';
  END IF;

  IF coalesce(p_quantity, 0) < 1
     OR p_quantity > 10000 THEN
    RAISE EXCEPTION 'INVALID_QUANTITY';
  END IF;

  v_prefix := regexp_replace(
    upper(trim(v_model.model_code)),
    '[^A-Z0-9]',
    '',
    'g'
  );
  v_month := to_char(p_production_month, 'YYMM');

  -- Serialize batches for the same model/month so concurrent requests
  -- cannot calculate the same starting sequence.
  PERFORM pg_advisory_xact_lock(hashtext(v_prefix || ':' || v_month));

  SELECT coalesce(
    max(
      nullif(
        regexp_replace(
          p.serial_number,
          '^' || v_prefix || v_month,
          ''
        ),
        ''
      )::bigint
    ),
    0
  ) + 1
  INTO v_start
  FROM public.products p
  WHERE p.model_id = v_model.id
    AND upper(p.serial_number) LIKE v_prefix || v_month || '%';

  v_batch :=
    v_prefix || '-' ||
    to_char(p_production_month, 'YYYYMM') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO public.product_serial_batches (
    batch_number,
    request_key,
    model_id,
    production_month,
    quantity,
    created_by
  )
  VALUES (
    v_batch,
    p_request_key,
    v_model.id,
    p_production_month,
    p_quantity,
    v_created_by
  );

  FOR i IN 0..p_quantity - 1 LOOP
    v_serial :=
      v_prefix ||
      v_month ||
      lpad((v_start + i)::text, 6, '0');

    v_qr_url :=
      'https://olitec-service-portal-weld.vercel.app/register/' ||
      v_serial;

    INSERT INTO public.products (
      model_id,
      serial_number,
      qr_code,
      manufacturing_date,
      batch_number,
      status
    )
    VALUES (
      v_model.id,
      v_serial,
      v_qr_url,
      p_production_month,
      v_batch,
      'manufactured'
    );

    model_code := v_model.model_code;
    serial_number := v_serial;
    qr_code := v_qr_url;
    production_month := p_production_month;
    batch_number := v_batch;
    RETURN NEXT;
  END LOOP;

EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'SERIAL_NUMBER_CONFLICT';
END;
$$;

REVOKE ALL ON FUNCTION public.admin_generate_serial_batch(uuid, date, integer, uuid)
FROM public;

GRANT EXECUTE ON FUNCTION public.admin_generate_serial_batch(uuid, date, integer, uuid)
TO authenticated;

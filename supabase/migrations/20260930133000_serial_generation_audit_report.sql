-- Serial-number generation audit report for Product Administration.
-- Shows each generated serial with product details and batch audit fields.

CREATE OR REPLACE FUNCTION public.admin_get_serial_generation_report()
RETURNS TABLE (
  product_id uuid,
  model_id uuid,
  model_code text,
  product_name text,
  capacity_kw numeric,
  mrp numeric,
  warranty_months integer,
  serial_number text,
  qr_code text,
  production_month date,
  batch_number text,
  created_by text,
  created_at timestamptz,
  downloaded_at timestamptz,
  download_count integer,
  product_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.ol_admin_allowed() THEN
    RAISE EXCEPTION 'ADMIN_ACCESS_REQUIRED';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    pm.id,
    pm.model_code,
    pm.product_name,
    pm.capacity_kw,
    pm.mrp,
    pm.warranty_months,
    p.serial_number,
    p.qr_code,
    p.manufacturing_date,
    b.batch_number,
    b.created_by,
    b.created_at,
    b.downloaded_at,
    b.download_count,
    p.status
  FROM public.products p
  JOIN public.product_models pm ON pm.id = p.model_id
  LEFT JOIN public.product_serial_batches b ON b.batch_number = p.batch_number
  ORDER BY b.created_at DESC NULLS LAST, p.serial_number DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_serial_generation_report() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_get_serial_generation_report() TO authenticated;

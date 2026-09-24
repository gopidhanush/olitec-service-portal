-- Ensure warranty and service lookup work with either a registration number or any
-- registered inverter serial number. A registration may contain multiple products.

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
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT
    wr.registration_number,
    wr.serial_number,
    wr.model_code,
    wr.product_name,
    wr.capacity_kw,
    wr.warranty_months,
    wr.warranty_start_date,
    wr.warranty_end_date,
    wr.status
  FROM public.warranty_registrations wr
  WHERE (
    upper(trim(wr.registration_number)) = upper(trim(p_registration_number))
    OR upper(trim(wr.serial_number)) = upper(trim(p_registration_number))
  )
  AND wr.status <> 'cancelled'
  ORDER BY wr.id;
$function$;

REVOKE ALL ON FUNCTION public.get_warranty_verification(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_warranty_verification(text) TO anon, authenticated;

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
  warranty_status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
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
    wr.status
  FROM public.warranty_registrations wr
  WHERE (
    upper(trim(wr.registration_number)) = upper(trim(p_registration_number))
    OR upper(trim(wr.serial_number)) = upper(trim(p_registration_number))
  )
  AND wr.status <> 'cancelled'
  ORDER BY wr.id;
$function$;

REVOKE ALL ON FUNCTION public.get_service_context(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_service_context(text) TO anon, authenticated;

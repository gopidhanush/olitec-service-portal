-- Fix multi-product warranty registrations.
-- The registration number intentionally belongs to a registration group and
-- therefore must be shared by multiple warranty rows. Only serial_number is unique.
ALTER TABLE public.warranty_registrations
  DROP CONSTRAINT IF EXISTS warranty_registrations_registration_number_key;

CREATE INDEX IF NOT EXISTS warranty_registrations_registration_number_idx
  ON public.warranty_registrations (registration_number);

CREATE OR REPLACE FUNCTION public.register_product_purchase(identifier text, registration jsonb)
RETURNS TABLE(registration_number text, serial_number text, model_code text, warranty_start_date date, warranty_end_date date, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_identifier text;
  v_registration_number text;
  v_purchase_date date;
  v_id bigint;
  v_serials text[];
  v_resolved_serials text[] := array[]::text[];
  v_product record;
begin
  -- Prevent two simultaneous submissions from generating the same number.
  perform pg_advisory_xact_lock(hashtext('olitec-warranty-registration-number'));

  if jsonb_typeof(registration->'serial_numbers') = 'array' then
    select array_agg(distinct upper(trim(value)))
      into v_serials
    from jsonb_array_elements_text(registration->'serial_numbers') as x(value)
    where trim(value) <> '';
  else
    v_serials := array[upper(trim(identifier))];
  end if;

  if v_serials is null or coalesce(array_length(v_serials, 1), 0) = 0 then
    v_serials := array[upper(trim(identifier))];
  end if;

  v_purchase_date := nullif(registration->>'purchase_date','')::date;
  if v_purchase_date is null then raise exception 'PURCHASE_DATE_REQUIRED'; end if;

  if nullif(registration->>'full_name','') is null
     or nullif(registration->>'mobile','') is null
     or nullif(registration->>'address','') is null
     or nullif(registration->>'city','') is null
     or nullif(registration->>'state','') is null
     or nullif(registration->>'pin_code','') is null
     or nullif(registration->>'dealer_name','') is null then
    raise exception 'REQUIRED_CUSTOMER_FIELDS_MISSING';
  end if;

  -- Resolve identifiers to canonical serial numbers. This prevents the same
  -- product being submitted twice through a serial + its QR identifier.
  foreach v_identifier in array v_serials loop
    select p.serial_number, pm.model_code, pm.product_name, pm.capacity_kw, pm.warranty_months
      into v_product
    from public.products p
    join public.product_models pm on pm.id = p.model_id
    where upper(trim(p.serial_number)) = upper(trim(v_identifier))
       or upper(trim(p.qr_code)) = upper(trim(v_identifier))
    limit 1;

    if not found then raise exception 'PRODUCT_NOT_FOUND:%', v_identifier; end if;

    if upper(trim(v_product.serial_number)) = any(v_resolved_serials) then
      continue;
    end if;

    v_resolved_serials := array_append(v_resolved_serials, upper(trim(v_product.serial_number)));

    if exists (
      select 1 from public.warranty_registrations wr
      where upper(trim(wr.serial_number)) = upper(trim(v_product.serial_number))
        and wr.status <> 'cancelled'
    ) then
      select wr.registration_number into v_registration_number
      from public.warranty_registrations wr
      where upper(trim(wr.serial_number)) = upper(trim(v_product.serial_number))
        and wr.status <> 'cancelled'
      order by wr.id
      limit 1;
      raise exception 'PRODUCT_ALREADY_REGISTERED:%', v_registration_number;
    end if;
  end loop;

  if coalesce(array_length(v_resolved_serials, 1), 0) = 0 then
    raise exception 'PRODUCT_NOT_FOUND:%', identifier;
  end if;

  -- A registration number is shared by all products in one registration.
  select 'OLR-' || to_char(current_date, 'YYYY') || '-' ||
         lpad((coalesce(max(id),0) + 1)::text, 6, '0')
    into v_registration_number
  from public.warranty_registrations;

  foreach v_identifier in array v_resolved_serials loop
    select p.serial_number, pm.model_code, pm.product_name, pm.capacity_kw, pm.warranty_months
      into v_product
    from public.products p
    join public.product_models pm on pm.id = p.model_id
    where upper(trim(p.serial_number)) = upper(trim(v_identifier))
    limit 1;

    insert into public.warranty_registrations (
      registration_number, serial_number, model_code, product_name, capacity_kw, warranty_months,
      warranty_start_date, warranty_end_date, full_name, mobile, email, address, city, state, pin_code,
      purchase_date, invoice_number, dealer_name, purchase_type, installation_date, installation_type,
      installer_name, installer_mobile, installation_address, installation_city, installation_state,
      installation_pin, invoice_path, status
    ) values (
      v_registration_number, v_product.serial_number, v_product.model_code, v_product.product_name,
      v_product.capacity_kw, v_product.warranty_months, v_purchase_date,
      (v_purchase_date + make_interval(months => v_product.warranty_months))::date - 1,
      registration->>'full_name', registration->>'mobile', nullif(registration->>'email',''), registration->>'address',
      registration->>'city', registration->>'state', registration->>'pin_code', v_purchase_date,
      nullif(registration->>'invoice_number',''), registration->>'dealer_name', registration->>'purchase_type',
      nullif(registration->>'installation_date','')::date, registration->>'installation_type',
      nullif(registration->>'installer_name',''), nullif(registration->>'installer_mobile',''),
      nullif(registration->>'installation_address',''), nullif(registration->>'installation_city',''),
      nullif(registration->>'installation_state',''), nullif(registration->>'installation_pin',''),
      nullif(registration->>'invoice_path',''), 'active'
    ) returning id into v_id;
  end loop;

  return query
    select wr.registration_number, wr.serial_number, wr.model_code, wr.warranty_start_date, wr.warranty_end_date, wr.status
    from public.warranty_registrations wr
    where wr.registration_number = v_registration_number
    order by wr.id;
exception
  when unique_violation then
    raise exception 'REGISTRATION_CONFLICT:%', SQLERRM;
end;
$function$;

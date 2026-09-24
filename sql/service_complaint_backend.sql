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

DROP FUNCTION IF EXISTS public.get_service_context(text);
create function public.get_service_context(p_registration_number text)
returns table (
  registration_number text, serial_number text, model_code text, product_name text, capacity_kw numeric,
  full_name text, mobile text, email text, address text, city text, state text, pin_code text,
  purchase_date date, warranty_start_date date, warranty_end_date date, warranty_status text,
  complaint_number text, complaint_status text, complaint_created_at timestamptz
)
language sql security definer set search_path = public
as $$
  select wr.registration_number, wr.serial_number, wr.model_code, wr.product_name, wr.capacity_kw,
         wr.full_name, wr.mobile, wr.email, wr.address, wr.city, wr.state, wr.pin_code,
         wr.purchase_date, wr.warranty_start_date, wr.warranty_end_date, wr.status,
         active_complaint.complaint_number, active_complaint.status, active_complaint.created_at
  from public.warranty_registrations wr
  left join lateral (
    select sc.complaint_number, sc.status, sc.created_at
    from public.service_complaints sc
    where upper(trim(sc.serial_number)) = upper(trim(wr.serial_number))
      and sc.status <> 'cancelled'
    order by case when lower(trim(sc.status)) <> 'closed' then 0 else 1 end, sc.created_at desc
    limit 1
  ) active_complaint on true
  where (upper(trim(wr.registration_number)) = upper(trim(p_registration_number))
      or upper(trim(wr.serial_number)) = upper(trim(p_registration_number)))
    and wr.status <> 'cancelled'
  order by wr.serial_number;
$$;
revoke all on function public.get_service_context(text) from public;
grant execute on function public.get_service_context(text) to anon, authenticated;

create or replace function public.create_service_complaint(p_registration_number text, p_complaint jsonb)
returns table (complaint_number text, registration_number text, serial_number text, status text)
language plpgsql security definer set search_path = public
as $$
declare
  v_registration public.warranty_registrations%rowtype;
  v_requested_serial text := nullif(upper(trim(p_complaint->>'serial_number')), '');
  v_complaint_number text;
  v_id bigint;
  v_existing public.service_complaints%rowtype;
begin
  if v_requested_serial is not null then
    select wr.* into v_registration from public.warranty_registrations wr
    where upper(trim(wr.serial_number)) = v_requested_serial
      and upper(trim(wr.registration_number)) = upper(trim(p_registration_number))
      and wr.status <> 'cancelled' limit 1;
    if v_registration.id is null then
      select wr.* into v_registration from public.warranty_registrations wr
      where upper(trim(wr.serial_number)) = v_requested_serial
        and wr.status <> 'cancelled' limit 1;
    end if;
  else
    select wr.* into v_registration from public.warranty_registrations wr
    where (upper(trim(wr.registration_number)) = upper(trim(p_registration_number))
        or upper(trim(wr.serial_number)) = upper(trim(p_registration_number)))
      and wr.status <> 'cancelled'
    order by wr.serial_number limit 1;
  end if;

  if v_registration.id is null then raise exception 'REGISTRATION_NOT_FOUND'; end if;
  if nullif(p_complaint->>'complaint_type','') is null then raise exception 'COMPLAINT_TYPE_REQUIRED'; end if;
  if nullif(p_complaint->>'problem_description','') is null then raise exception 'PROBLEM_DESCRIPTION_REQUIRED'; end if;

  select sc.* into v_existing
  from public.service_complaints sc
  where upper(trim(sc.serial_number)) = upper(trim(v_registration.serial_number))
    and lower(trim(coalesce(sc.status,''))) not in ('closed','cancelled')
  order by sc.created_at desc limit 1;

  if v_existing.id is not null then
    raise exception 'COMPLAINT_ALREADY_OPEN:%:%:%', v_existing.complaint_number, v_existing.status, v_registration.serial_number;
  end if;

  select 'OLC-' || to_char(current_date,'YYYY') || '-' || lpad((coalesce(max(sc.id),0)+1)::text,6,'0')
  into v_complaint_number from public.service_complaints sc;

  insert into public.service_complaints (
    complaint_number, registration_number, serial_number, model_code, product_name, full_name, mobile, email,
    address, city, state, pin_code, complaint_type, problem_description, purchase_date, preferred_visit_date,
    preferred_contact_time, service_address, service_city, service_state, service_pin, status
  ) values (
    v_complaint_number, v_registration.registration_number, v_registration.serial_number, v_registration.model_code,
    v_registration.product_name, v_registration.full_name, v_registration.mobile, v_registration.email,
    v_registration.address, v_registration.city, v_registration.state, v_registration.pin_code,
    p_complaint->>'complaint_type', p_complaint->>'problem_description', v_registration.purchase_date,
    nullif(p_complaint->>'preferred_visit_date','')::date, nullif(p_complaint->>'preferred_contact_time',''),
    coalesce(nullif(p_complaint->>'service_address',''),v_registration.address),
    coalesce(nullif(p_complaint->>'service_city',''),v_registration.city),
    coalesce(nullif(p_complaint->>'service_state',''),v_registration.state),
    coalesce(nullif(p_complaint->>'service_pin',''),v_registration.pin_code), 'received'
  ) returning id into v_id;

  return query select sc.complaint_number, sc.registration_number, sc.serial_number, sc.status
  from public.service_complaints sc where sc.id = v_id;
exception when unique_violation then raise exception 'COMPLAINT_CONFLICT';
end;
$$;
revoke all on function public.create_service_complaint(text,jsonb) from public;
grant execute on function public.create_service_complaint(text,jsonb) to anon, authenticated;

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

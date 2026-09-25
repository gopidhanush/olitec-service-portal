create or replace function public.admin_get_product_registration_history(p_search text default null, p_limit integer default 100, p_offset integer default 0)
returns table (
  registration_number text,
  registered_at timestamptz,
  full_name text,
  mobile text,
  email text,
  address text,
  city text,
  state text,
  pin_code text,
  purchase_date date,
  invoice_number text,
  dealer_name text,
  serial_number text,
  model_code text,
  product_name text,
  capacity_kw numeric,
  product_image_url text,
  warranty_start_date date,
  warranty_end_date date,
  warranty_status text,
  complaint_count bigint,
  open_complaint_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.service_admins sa where lower(sa.email)=lower(coalesce(auth.jwt()->>'email','')) and sa.active=true and (sa.product_admin=true or sa.super_admin=true)) then
    raise exception 'PRODUCT_ADMIN_ACCESS_REQUIRED';
  end if;
  return query
  with base as (
    select wr.*, pm.image_url, pm.capacity_kw as model_capacity,
      (select count(*) from public.service_complaints sc where sc.registration_number=wr.registration_number) as cc,
      (select count(*) from public.service_complaints sc where sc.registration_number=wr.registration_number and sc.status not in ('closed','cancelled')) as occ
    from public.warranty_registrations wr
    left join public.product_models pm on upper(pm.model_code)=upper(wr.model_code)
    where p_search is null or trim(p_search)='' or wr.registration_number ilike '%'||p_search||'%' or wr.serial_number ilike '%'||p_search||'%' or wr.full_name ilike '%'||p_search||'%' or coalesce(wr.email,'') ilike '%'||p_search||'%' or wr.mobile ilike '%'||p_search||'%' or wr.model_code ilike '%'||p_search||'%'
    order by wr.created_at desc, wr.registration_number desc, wr.serial_number
    limit greatest(1,least(coalesce(p_limit,100),500)) offset greatest(0,coalesce(p_offset,0))
  )
  select b.registration_number,b.created_at,b.full_name,b.mobile,b.email,b.address,b.city,b.state,b.pin_code,b.purchase_date,b.invoice_number,b.dealer_name,b.serial_number,b.model_code,b.product_name,coalesce(b.capacity_kw,b.model_capacity),b.image_url,b.warranty_start_date,b.warranty_end_date,b.status,b.cc,b.occ from base b;
end;
$$;
revoke all on function public.admin_get_product_registration_history(text,integer,integer) from public;
grant execute on function public.admin_get_product_registration_history(text,integer,integer) to authenticated;

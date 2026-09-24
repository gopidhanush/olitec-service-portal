-- OLITEC admin product management backend.
-- This migration is already applied to the connected Supabase project.

alter table public.product_models add column if not exists image_url text;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('products','products',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "OLITEC public product image read" on storage.objects;
create policy "OLITEC public product image read" on storage.objects for select to public using (bucket_id='products');

drop policy if exists "OLITEC admin product image upload" on storage.objects;
create policy "OLITEC admin product image upload" on storage.objects for insert to authenticated
with check (bucket_id='products' and exists (select 1 from public.service_admins sa where lower(sa.email)=lower(coalesce(auth.jwt()->>'email','')) and sa.active=true));

drop policy if exists "OLITEC admin product image update" on storage.objects;
create policy "OLITEC admin product image update" on storage.objects for update to authenticated
using (bucket_id='products' and exists (select 1 from public.service_admins sa where lower(sa.email)=lower(coalesce(auth.jwt()->>'email','')) and sa.active=true))
with check (bucket_id='products' and exists (select 1 from public.service_admins sa where lower(sa.email)=lower(coalesce(auth.jwt()->>'email','')) and sa.active=true));

drop policy if exists "OLITEC admin product image delete" on storage.objects;
create policy "OLITEC admin product image delete" on storage.objects for delete to authenticated
using (bucket_id='products' and exists (select 1 from public.service_admins sa where lower(sa.email)=lower(coalesce(auth.jwt()->>'email','')) and sa.active=true));

create or replace function public.ol_admin_allowed() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.service_admins sa where lower(sa.email)=lower(coalesce(auth.jwt()->>'email','')) and sa.active=true);
$$;
revoke all on function public.ol_admin_allowed() from public;
grant execute on function public.ol_admin_allowed() to authenticated;

create or replace function public.admin_get_product_catalog()
returns table (model_id uuid, model_code text, product_name text, capacity_kw numeric, warranty_months integer, image_url text, product_id uuid, serial_number text, qr_code text, manufacturing_date date, batch_number text, product_status text)
language sql security definer set search_path=public as $$
  select pm.id,pm.model_code,pm.product_name,pm.capacity_kw,pm.warranty_months,pm.image_url,p.id,p.serial_number,p.qr_code,p.manufacturing_date,p.batch_number,p.status
  from public.product_models pm left join public.products p on p.model_id=pm.id
  where public.ol_admin_allowed() order by pm.model_code,p.serial_number;
$$;
revoke all on function public.admin_get_product_catalog() from public;
grant execute on function public.admin_get_product_catalog() to authenticated;

create or replace function public.admin_create_product_batch(p_model_code text,p_product_name text,p_capacity_kw numeric,p_warranty_months integer,p_manufacturing_date date,p_quantity integer,p_image_url text default null)
returns table (model_code text, serial_number text, qr_code text, manufacturing_date date, batch_number text)
language plpgsql security definer set search_path=public as $$
declare
  v_model public.product_models%rowtype; v_prefix text:=regexp_replace(upper(trim(p_model_code)),'[^A-Z0-9]','','g'); v_month text:=to_char(p_manufacturing_date,'YYMM'); v_start bigint; v_batch text:=v_prefix||'-'||to_char(p_manufacturing_date,'YYYYMMDD')||'-'||to_char(clock_timestamp(),'HH24MISSMS'); i integer; v_serial text;
begin
  if not public.ol_admin_allowed() then raise exception 'ADMIN_ACCESS_REQUIRED'; end if;
  if nullif(trim(p_model_code),'') is null or nullif(trim(p_product_name),'') is null then raise exception 'MODEL_AND_PRODUCT_NAME_REQUIRED'; end if;
  if p_manufacturing_date is null then raise exception 'PRODUCTION_DATE_REQUIRED'; end if;
  if coalesce(p_quantity,0)<1 or p_quantity>10000 then raise exception 'INVALID_QUANTITY'; end if;
  if coalesce(p_warranty_months,0)<1 then raise exception 'INVALID_WARRANTY_MONTHS'; end if;
  if v_prefix='' then raise exception 'INVALID_MODEL_CODE'; end if;
  select * into v_model from public.product_models where upper(model_code)=upper(trim(p_model_code)) limit 1;
  if v_model.id is null then insert into public.product_models(model_code,product_name,capacity_kw,warranty_months,image_url) values(trim(p_model_code),trim(p_product_name),p_capacity_kw,p_warranty_months,nullif(trim(p_image_url),'')) returning * into v_model;
  else update public.product_models set product_name=trim(p_product_name),capacity_kw=p_capacity_kw,warranty_months=p_warranty_months,image_url=coalesce(nullif(trim(p_image_url),''),image_url) where id=v_model.id returning * into v_model; end if;
  perform pg_advisory_xact_lock(hashtext(v_prefix||':'||v_month));
  select coalesce(max(nullif(regexp_replace(p.serial_number,'^'||v_prefix||v_month,'',''), '')::bigint),0)+1 into v_start from public.products p where p.model_id=v_model.id and upper(p.serial_number) like v_prefix||v_month||'%';
  for i in 0..p_quantity-1 loop
    v_serial:=v_prefix||v_month||lpad((v_start+i)::text,6,'0');
    insert into public.products(model_id,serial_number,qr_code,manufacturing_date,batch_number,status) values(v_model.id,v_serial,v_serial,p_manufacturing_date,v_batch,'manufactured');
    model_code:=v_model.model_code;serial_number:=v_serial;qr_code:=v_serial;manufacturing_date:=p_manufacturing_date;batch_number:=v_batch;return next;
  end loop;
exception when unique_violation then raise exception 'SERIAL_NUMBER_CONFLICT';
end;
$$;
revoke all on function public.admin_create_product_batch(text,text,numeric,integer,date,integer,text) from public;
grant execute on function public.admin_create_product_batch(text,text,numeric,integer,date,integer,text) to authenticated;

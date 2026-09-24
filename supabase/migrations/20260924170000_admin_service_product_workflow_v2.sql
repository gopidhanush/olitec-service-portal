-- OLITEC admin workflow v2
-- Service assignment/closure + product master/serial batch separation + protected re-downloads.

alter table public.service_complaints
  add column if not exists assigned_engineer_name text,
  add column if not exists assigned_engineer_mobile text,
  add column if not exists action_taken text,
  add column if not exists assigned_at timestamptz,
  add column if not exists closed_at timestamptz;

alter table public.product_models
  add column if not exists mrp numeric(12,2),
  add column if not exists warranty_years integer;

update public.product_models set warranty_years = greatest(1, ceil(coalesce(warranty_months,12)::numeric / 12)::integer) where warranty_years is null;

create table if not exists public.product_serial_batches (
  id uuid primary key default gen_random_uuid(),
  batch_number text not null unique,
  request_key uuid not null unique,
  model_id uuid not null references public.product_models(id),
  production_month date not null,
  quantity integer not null check (quantity > 0 and quantity <= 10000),
  created_by text not null,
  created_at timestamptz not null default now(),
  downloaded_at timestamptz,
  download_count integer not null default 0
);
create index if not exists idx_product_serial_batches_model_month on public.product_serial_batches(model_id, production_month);
create index if not exists idx_products_batch_number on public.products(batch_number);
alter table public.product_serial_batches enable row level security;

-- The following functions are intentionally security-definer and only callable by active OLITEC admins.
drop policy if exists "OLITEC admin batch read" on public.product_serial_batches;
create policy "OLITEC admin batch read" on public.product_serial_batches for select to authenticated using (public.ol_admin_allowed());

drop function if exists public.admin_get_product_catalog();
drop function if exists public.get_service_admin_complaints();
drop function if exists public.update_service_complaint_status(text,text);
drop function if exists public.update_service_complaint_status(text,text,text,text,text);

create or replace function public.admin_get_product_catalog()
returns table (model_id uuid, model_code text, product_name text, capacity_kw numeric, warranty_months integer, warranty_years integer, mrp numeric, image_url text, product_id uuid, serial_number text, qr_code text, manufacturing_date date, batch_number text, product_status text)
language sql security definer set search_path=public as $$
  select pm.id,pm.model_code,pm.product_name,pm.capacity_kw,pm.warranty_months,pm.warranty_years,pm.mrp,pm.image_url,p.id,p.serial_number,p.qr_code,p.manufacturing_date,p.batch_number,p.status
  from public.product_models pm left join public.products p on p.model_id=pm.id
  where public.ol_admin_allowed() order by pm.model_code,p.serial_number;
$$;
revoke all on function public.admin_get_product_catalog() from public;
grant execute on function public.admin_get_product_catalog() to authenticated;

create or replace function public.admin_create_product_model(p_model_code text,p_product_name text,p_capacity_kw numeric,p_mrp numeric,p_warranty_years integer,p_image_url text default null)
returns table (model_id uuid, model_code text, product_name text, capacity_kw numeric, mrp numeric, warranty_years integer, warranty_months integer, image_url text)
language plpgsql security definer set search_path=public as $$
declare v_model public.product_models%rowtype;
begin
  if not public.ol_admin_allowed() then raise exception 'ADMIN_ACCESS_REQUIRED'; end if;
  if nullif(trim(p_model_code),'') is null then raise exception 'MODEL_NUMBER_REQUIRED'; end if;
  if nullif(trim(p_product_name),'') is null then raise exception 'PRODUCT_NAME_REQUIRED'; end if;
  if coalesce(p_mrp,0)<=0 then raise exception 'MRP_REQUIRED'; end if;
  if coalesce(p_warranty_years,0)<1 or p_warranty_years>20 then raise exception 'INVALID_WARRANTY_YEARS'; end if;
  select * into v_model from public.product_models where upper(model_code)=upper(trim(p_model_code)) limit 1;
  if v_model.id is null then
    insert into public.product_models(model_code,product_name,capacity_kw,warranty_months,warranty_years,mrp,image_url)
    values(trim(p_model_code),trim(p_product_name),p_capacity_kw,p_warranty_years*12,p_warranty_years,p_mrp,nullif(trim(p_image_url),'')) returning * into v_model;
  else
    update public.product_models set product_name=trim(p_product_name),capacity_kw=p_capacity_kw,warranty_months=p_warranty_years*12,warranty_years=p_warranty_years,mrp=p_mrp,image_url=coalesce(nullif(trim(p_image_url),''),image_url) where id=v_model.id returning * into v_model;
  end if;
  return query select v_model.id,v_model.model_code,v_model.product_name,v_model.capacity_kw,v_model.mrp,v_model.warranty_years,v_model.warranty_months,v_model.image_url;
end;
$$;
revoke all on function public.admin_create_product_model(text,text,numeric,numeric,integer,text) from public;
grant execute on function public.admin_create_product_model(text,text,numeric,numeric,integer,text) to authenticated;

create or replace function public.admin_get_product_batches()
returns table (batch_number text,model_code text,product_name text,production_month date,quantity integer,created_by text,created_at timestamptz,downloaded_at timestamptz,download_count integer)
language sql security definer set search_path=public as $$
 select b.batch_number,pm.model_code,pm.product_name,b.production_month,b.quantity,b.created_by,b.created_at,b.downloaded_at,b.download_count from public.product_serial_batches b join public.product_models pm on pm.id=b.model_id where public.ol_admin_allowed() order by b.created_at desc;
$$;
revoke all on function public.admin_get_product_batches() from public;
grant execute on function public.admin_get_product_batches() to authenticated;

create or replace function public.admin_generate_serial_batch(p_model_id uuid,p_production_month date,p_quantity integer,p_request_key uuid)
returns table (model_code text,serial_number text,qr_code text,production_month date,batch_number text)
language plpgsql security definer set search_path=public as $$
declare v_model public.product_models%rowtype;v_prefix text;v_month text;v_start bigint;v_batch text;i integer;v_serial text;v_existing_batch public.product_serial_batches%rowtype;v_created_by text:=lower(coalesce(auth.jwt()->>'email','unknown'));
begin
 if not public.ol_admin_allowed() then raise exception 'ADMIN_ACCESS_REQUIRED'; end if;
 if p_request_key is null then raise exception 'REQUEST_KEY_REQUIRED'; end if;
 select * into v_existing_batch from public.product_serial_batches where request_key=p_request_key limit 1;
 if v_existing_batch.id is not null then raise exception 'BATCH_REQUEST_ALREADY_USED'; end if;
 select * into v_model from public.product_models where id=p_model_id and is_active=true limit 1;
 if v_model.id is null then raise exception 'PRODUCT_MODEL_NOT_FOUND'; end if;
 if p_production_month is null or extract(day from p_production_month)<>1 then raise exception 'PRODUCTION_MONTH_REQUIRED'; end if;
 if coalesce(p_quantity,0)<1 or p_quantity>10000 then raise exception 'INVALID_QUANTITY'; end if;
 v_prefix:=regexp_replace(upper(trim(v_model.model_code)),'[^A-Z0-9]','','g');v_month:=to_char(p_production_month,'YYMM');
 perform pg_advisory_xact_lock(hashtext(v_prefix||':'||v_month));
 select coalesce(max(nullif(regexp_replace(p.serial_number,'^'||v_prefix||v_month||'',''),'')::bigint),0)+1 into v_start from public.products p where p.model_id=v_model.id and upper(p.serial_number) like v_prefix||v_month||'%';
 v_batch:=v_prefix||'-'||to_char(p_production_month,'YYYYMM')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
 insert into public.product_serial_batches(batch_number,request_key,model_id,production_month,quantity,created_by) values(v_batch,p_request_key,v_model.id,p_production_month,p_quantity,v_created_by);
 for i in 0..p_quantity-1 loop
  v_serial:=v_prefix||v_month||lpad((v_start+i)::text,6,'0');
  insert into public.products(model_id,serial_number,qr_code,manufacturing_date,batch_number,status) values(v_model.id,v_serial,v_serial,p_production_month,v_batch,'manufactured');
  model_code:=v_model.model_code;serial_number:=v_serial;qr_code:=v_serial;production_month:=p_production_month;batch_number:=v_batch;return next;
 end loop;
exception when unique_violation then raise exception 'SERIAL_NUMBER_CONFLICT';
end;
$$;
revoke all on function public.admin_generate_serial_batch(uuid,date,integer,uuid) from public;
grant execute on function public.admin_generate_serial_batch(uuid,date,integer,uuid) to authenticated;

create or replace function public.admin_mark_serial_batch_downloaded(p_batch_number text) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.ol_admin_allowed() then raise exception 'ADMIN_ACCESS_REQUIRED'; end if;
 update public.product_serial_batches set downloaded_at=coalesce(downloaded_at,now()),download_count=download_count+1 where batch_number=trim(p_batch_number);
 if not found then raise exception 'BATCH_NOT_FOUND'; end if;
end;
$$;
revoke all on function public.admin_mark_serial_batch_downloaded(text) from public;
grant execute on function public.admin_mark_serial_batch_downloaded(text) to authenticated;

create or replace function public.admin_get_serial_batch_for_redownload(p_batch_number text)
returns table (model_code text,serial_number text,qr_code text,production_month date,batch_number text)
language plpgsql security definer set search_path=public as $$
begin
 if not public.ol_admin_allowed() then raise exception 'ADMIN_ACCESS_REQUIRED'; end if;
 update public.product_serial_batches set download_count=download_count+1 where batch_number=trim(p_batch_number);
 if not found then raise exception 'BATCH_NOT_FOUND'; end if;
 return query select pm.model_code,p.serial_number,p.qr_code,b.production_month,b.batch_number from public.product_serial_batches b join public.product_models pm on pm.id=b.model_id join public.products p on p.batch_number=b.batch_number where b.batch_number=trim(p_batch_number) order by p.serial_number;
end;
$$;
revoke all on function public.admin_get_serial_batch_for_redownload(text) from public;
grant execute on function public.admin_get_serial_batch_for_redownload(text) to authenticated;

create or replace function public.get_service_admin_complaints()
returns table (complaint_number text,registration_number text,serial_number text,model_code text,product_name text,full_name text,mobile text,complaint_type text,problem_description text,status text,preferred_visit_date date,preferred_contact_time text,service_city text,service_state text,created_at timestamptz,assigned_engineer_name text,assigned_engineer_mobile text,action_taken text,assigned_at timestamptz,closed_at timestamptz)
language sql security definer set search_path=public as $$
 select sc.complaint_number,sc.registration_number,sc.serial_number,sc.model_code,sc.product_name,sc.full_name,sc.mobile,sc.complaint_type,sc.problem_description,sc.status,sc.preferred_visit_date,sc.preferred_contact_time,sc.service_city,sc.service_state,sc.created_at,sc.assigned_engineer_name,sc.assigned_engineer_mobile,sc.action_taken,sc.assigned_at,sc.closed_at from public.service_complaints sc where public.ol_admin_allowed() and sc.status<>'cancelled' order by sc.created_at desc;
$$;
revoke all on function public.get_service_admin_complaints() from public;
grant execute on function public.get_service_admin_complaints() to authenticated;

create or replace function public.update_service_complaint_status(p_complaint_number text,p_status text,p_engineer_name text default null,p_engineer_mobile text default null,p_action_taken text default null)
returns void language plpgsql security definer set search_path=public as $$
declare v_current text;
begin
 if not public.ol_admin_allowed() then raise exception 'ADMIN_ACCESS_REQUIRED'; end if;
 select status into v_current from public.service_complaints where complaint_number=trim(p_complaint_number) for update;
 if v_current is null then raise exception 'COMPLAINT_NOT_FOUND'; end if;
 if lower(v_current)='closed' and lower(p_status)<>'closed' then raise exception 'CLOSED_COMPLAINT_CANNOT_BE_REOPENED'; end if;
 if lower(p_status)='assigned' then
  if nullif(trim(p_engineer_name),'') is null or nullif(trim(p_engineer_mobile),'') is null then raise exception 'ENGINEER_DETAILS_REQUIRED'; end if;
  update public.service_complaints set status='assigned',assigned_engineer_name=trim(p_engineer_name),assigned_engineer_mobile=trim(p_engineer_mobile),assigned_at=coalesce(assigned_at,now()) where complaint_number=trim(p_complaint_number);
 elsif lower(p_status)='closed' then
  if nullif(trim(p_action_taken),'') is null then raise exception 'ACTION_TAKEN_REQUIRED'; end if;
  update public.service_complaints set status='closed',action_taken=trim(p_action_taken),closed_at=now() where complaint_number=trim(p_complaint_number);
 elsif lower(p_status) in ('received','technician_visit','under_service','resolved') then
  update public.service_complaints set status=lower(p_status) where complaint_number=trim(p_complaint_number);
 else raise exception 'INVALID_SERVICE_STATUS'; end if;
end;
$$;
revoke all on function public.update_service_complaint_status(text,text,text,text,text) from public;
grant execute on function public.update_service_complaint_status(text,text,text,text,text) to authenticated;

-- Prevent accidental regeneration of a production serial batch for the same model/month.
alter table public.product_serial_batches add constraint product_serial_batches_model_month_unique unique (model_id, production_month);

create or replace function public.admin_generate_serial_batch(p_model_id uuid,p_production_month date,p_quantity integer,p_request_key uuid)
returns table (model_code text,serial_number text,qr_code text,production_month date,batch_number text)
language plpgsql security definer set search_path=public as $$
declare v_model public.product_models%rowtype;v_prefix text;v_month text;v_start bigint;v_batch text;i integer;v_serial text;v_existing_batch public.product_serial_batches%rowtype;v_created_by text:=lower(coalesce(auth.jwt()->>'email','unknown'));
begin
 if not public.ol_admin_allowed() then raise exception 'ADMIN_ACCESS_REQUIRED'; end if;
 if p_request_key is null then raise exception 'REQUEST_KEY_REQUIRED'; end if;
 select * into v_existing_batch from public.product_serial_batches where request_key=p_request_key limit 1;
 if v_existing_batch.id is not null then raise exception 'BATCH_REQUEST_ALREADY_USED'; end if;
 select * into v_existing_batch from public.product_serial_batches where model_id=p_model_id and production_month=p_production_month limit 1;
 if v_existing_batch.id is not null then raise exception 'BATCH_ALREADY_GENERATED_FOR_PRODUCTION_MONTH'; end if;
 select * into v_model from public.product_models where id=p_model_id and is_active=true limit 1;
 if v_model.id is null then raise exception 'PRODUCT_MODEL_NOT_FOUND'; end if;
 if p_production_month is null or extract(day from p_production_month)<>1 then raise exception 'PRODUCTION_MONTH_REQUIRED'; end if;
 if coalesce(p_quantity,0)<1 or p_quantity>10000 then raise exception 'INVALID_QUANTITY'; end if;
 v_prefix:=regexp_replace(upper(trim(v_model.model_code)),'[^A-Z0-9]','','g');v_month:=to_char(p_production_month,'YYMM');
 perform pg_advisory_xact_lock(hashtext(v_prefix||':'||v_month));
 select coalesce(max(nullif(regexp_replace(p.serial_number,'^'||v_prefix||v_month,'','')::text,'')::bigint),0)+1 into v_start from public.products p where p.model_id=v_model.id and upper(p.serial_number) like v_prefix||v_month||'%';
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

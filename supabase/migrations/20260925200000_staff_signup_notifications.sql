-- OLITEC staff signup notification
-- Queue an email to the Super Admin whenever a new staff administration account is created.

alter table public.notification_events
  add column if not exists staff_email text;

drop index if exists public.notification_events_dedupe_idx;
create unique index if not exists notification_events_dedupe_idx
  on public.notification_events(
    event_type,
    coalesce(registration_number,''),
    coalesce(complaint_number,''),
    coalesce(staff_email,'')
  );

do $$
begin
  alter table public.notification_events drop constraint if exists notification_events_event_type_check;
  alter table public.notification_events
    add constraint notification_events_event_type_check
    check (event_type in ('product_registered','complaint_received','complaint_closed','staff_registered'));
end $$;

create or replace function public.queue_olitec_notification()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  -- New OLITEC staff administration account.
  if TG_TABLE_SCHEMA='auth' and TG_TABLE_NAME='users' and TG_OP='INSERT' then
    insert into public.notification_events(event_type,staff_email,recipient_email)
    values('staff_registered',NULLIF(lower(trim(NEW.email)),''),'admin@gsons.co.in')
    on conflict do nothing;
    return NEW;
  end if;

  if TG_TABLE_NAME='warranty_registrations' and TG_OP='INSERT' then
    insert into public.notification_events(event_type,registration_number,recipient_email)
    values('product_registered',NEW.registration_number,NULLIF(trim(NEW.email),''))
    on conflict do nothing;
    return NEW;
  end if;

  if TG_TABLE_NAME='service_complaints' and TG_OP='INSERT' then
    insert into public.notification_events(event_type,complaint_number,registration_number,recipient_email)
    values('complaint_received',NEW.complaint_number,NEW.registration_number,NULLIF(trim(NEW.email),''))
    on conflict do nothing;
    return NEW;
  end if;

  if TG_TABLE_NAME='service_complaints' and TG_OP='UPDATE' then
    if lower(coalesce(NEW.status,''))='closed' and lower(coalesce(OLD.status,''))<>'closed' then
      insert into public.notification_events(event_type,complaint_number,registration_number,recipient_email)
      values('complaint_closed',NEW.complaint_number,NEW.registration_number,NULLIF(trim(NEW.email),''))
      on conflict do nothing;
    end if;
    return NEW;
  end if;

  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created_staff_notification on auth.users;
create trigger on_auth_user_created_staff_notification
after insert on auth.users
for each row execute function public.queue_olitec_notification();

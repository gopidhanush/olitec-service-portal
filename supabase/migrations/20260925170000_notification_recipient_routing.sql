-- OLITEC notification recipient routing
-- Product registrations additionally notify the configured product manager.
-- Service requests additionally notify the configured service in-charge.

insert into public.notification_settings(key,value)
values
  ('product_manager_email',''),
  ('service_incharge_email','')
on conflict (key) do nothing;

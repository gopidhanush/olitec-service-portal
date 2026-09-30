-- Fix admin permission helper execution for authenticated admin users.
-- The helper itself performs the actual admin-role check, so exposing EXECUTE
-- to authenticated users does not grant admin access by itself.

GRANT EXECUTE ON FUNCTION public.ol_admin_allowed() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ol_product_admin_allowed() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ol_service_admin_allowed() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ol_super_admin_allowed() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_permissions() TO authenticated;

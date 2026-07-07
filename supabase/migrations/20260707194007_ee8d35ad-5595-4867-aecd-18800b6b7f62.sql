
-- has_role: signed-in only (used by RLS); remove default public/anon access
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- claim_admin: signed-in only
REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

-- Split lessons SELECT so anon never calls has_role
DROP POLICY "Published lessons viewable by everyone" ON public.lessons;
CREATE POLICY "Anon view published lessons" ON public.lessons FOR SELECT TO anon USING (published);
CREATE POLICY "Auth view lessons" ON public.lessons FOR SELECT TO authenticated USING (published OR public.has_role(auth.uid(), 'admin'));

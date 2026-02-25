
-- Fix: The handle_new_user trigger runs as SECURITY DEFINER so it bypasses RLS.
-- We can restrict direct company creation to prevent abuse.
DROP POLICY "Allow insert for signup" ON public.companies;

-- Only allow insert if the user doesn't already have a profile (first-time signup)
CREATE POLICY "Allow insert for new signup" ON public.companies FOR INSERT TO authenticated
  WITH CHECK (NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

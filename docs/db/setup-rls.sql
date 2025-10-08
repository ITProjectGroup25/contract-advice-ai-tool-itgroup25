-- =============================================
-- Row Level Security (RLS) Configuration
-- =============================================

-- Step 1: Check the structure of the form table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'form'
ORDER BY ordinal_position;

-- =============================================
-- NOTE: Before executing the following RLS policies, make sure:
-- 1. The form table has the column owner_id
-- 2. Supabase Auth is configured
-- 3. auth.uid() and auth.role() functions are available
-- =============================================

-- Step 2: Add owner_id to the form table (if it does not exist)
-- Uncomment the following code to add the column:
/*
ALTER TABLE public.form 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Create index to improve query performance
CREATE INDEX IF NOT EXISTS idx_form_owner ON public.form(owner_id);
*/

-- Step 3: Enable RLS
ALTER TABLE public.form ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_results ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies

-- ==================== FORM Table Policies ====================

-- Policy 1: SELECT – Only owner or admin can read
DROP POLICY IF EXISTS "form_read_policy" ON public.form;
CREATE POLICY "form_read_policy"
ON public.form
FOR SELECT
USING (
  -- Public access (if owner_id is NULL)
  owner_id IS NULL
  OR
  -- Owner can read
  owner_id = auth.uid()
  OR
  -- Admin can read (if admin_user table exists)
  EXISTS (
    SELECT 1 FROM public.admin_user
    WHERE admin_user.id = (auth.uid()::text)::bigint
      AND is_active = true
  )
);

-- Policy 2: INSERT – Automatically set owner_id to current user
DROP POLICY IF EXISTS "form_insert_policy" ON public.form;
CREATE POLICY "form_insert_policy"
ON public.form
FOR INSERT
WITH CHECK (
  -- Must be an authenticated user
  auth.uid() IS NOT NULL
  AND
  -- owner_id must match the current user (to prevent spoofing)
  (owner_id IS NULL OR owner_id = auth.uid())
);

-- Policy 3: UPDATE – Only owner or admin can update
DROP POLICY IF EXISTS "form_update_policy" ON public.form;
CREATE POLICY "form_update_policy"
ON public.form
FOR UPDATE
USING (
  owner_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.admin_user
    WHERE admin_user.id = (auth.uid()::text)::bigint
      AND is_active = true
  )
)
WITH CHECK (
  -- Prevent modification of owner_id
  owner_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.admin_user
    WHERE admin_user.id = (auth.uid()::text)::bigint
      AND is_active = true
  )
);

-- Policy 4: DELETE – Only owner or admin can delete
DROP POLICY IF EXISTS "form_delete_policy" ON public.form;
CREATE POLICY "form_delete_policy"
ON public.form
FOR DELETE
USING (
  owner_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.admin_user
    WHERE admin_user.id = (auth.uid()::text)::bigint
      AND is_active = true
  )
);

-- ==================== FORM_DETAILS Table Policies ====================

-- Policy 1: SELECT – Access controlled via associated form
DROP POLICY IF EXISTS "form_details_read_policy" ON public.form_details;
CREATE POLICY "form_details_read_policy"
ON public.form_details
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.form f
    WHERE f.id = form_details.form_id
      AND (
        f.owner_id IS NULL
        OR f.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.admin_user
          WHERE admin_user.id = (auth.uid()::text)::bigint
            AND is_active = true
        )
      )
  )
);

-- Policy 2: INSERT – Must have permission for the associated form
DROP POLICY IF EXISTS "form_details_insert_policy" ON public.form_details;
CREATE POLICY "form_details_insert_policy"
ON public.form_details
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.form f
    WHERE f.id = form_details.form_id
      AND (
        f.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.admin_user
          WHERE admin_user.id = (auth.uid()::text)::bigint
            AND is_active = true
        )
      )
  )
);

-- Policy 3: UPDATE – Same as insert
DROP POLICY IF EXISTS "form_details_update_policy" ON public.form_details;
CREATE POLICY "form_details_update_policy"
ON public.form_details
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.form f
    WHERE f.id = form_details.form_id
      AND (
        f.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.admin_user
          WHERE admin_user.id = (auth.uid()::text)::bigint
            AND is_active = true
        )
      )
  )
);

-- Policy 4: DELETE – Same as insert
DROP POLICY IF EXISTS "form_details_delete_policy" ON public.form_details;
CREATE POLICY "form_details_delete_policy"
ON public.form_details
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.form f
    WHERE f.id = form_details.form_id
      AND (
        f.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.admin_user
          WHERE admin_user.id = (auth.uid()::text)::bigint
            AND is_active = true
        )
      )
  )
);

-- ==================== FORM_RESULTS Table Policies ====================

-- Policy 1: SELECT – Access controlled via associated form
DROP POLICY IF EXISTS "form_results_read_policy" ON public.form_results;
CREATE POLICY "form_results_read_policy"
ON public.form_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.form f
    WHERE f.id = form_results.form_id
      AND (
        f.owner_id IS NULL
        OR f.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.admin_user
          WHERE admin_user.id = (auth.uid()::text)::bigint
            AND is_active = true
        )
      )
  )
);

-- Policy 2: INSERT – Anyone can submit form results (for public forms)
DROP POLICY IF EXISTS "form_results_insert_policy" ON public.form_results;
CREATE POLICY "form_results_insert_policy"
ON public.form_results
FOR INSERT
WITH CHECK (
  -- Allow anonymous submissions if the form is active (public)
  EXISTS (
    SELECT 1 FROM public.form f
    WHERE f.id = form_results.form_id
      AND f.status = 'Active'
  )
);

-- Policy 3: UPDATE – Only admin can update form results
DROP POLICY IF EXISTS "form_results_update_policy" ON public.form_results;
CREATE POLICY "form_results_update_policy"
ON public.form_results
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_user
    WHERE admin_user.id = (auth.uid()::text)::bigint
      AND is_active = true
  )
);

-- Policy 4: DELETE – Only admin can delete form results
DROP POLICY IF EXISTS "form_results_delete_policy" ON public.form_results;
CREATE POLICY "form_results_delete_policy"
ON public.form_results
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_user
    WHERE admin_user.id = (auth.uid()::text)::bigint
      AND is_active = true
  )
);

-- =============================================
-- Verify RLS is enabled
-- =============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('form', 'form_details', 'form_results')
ORDER BY tablename;

-- =============================================
-- View all existing policies
-- =============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('form', 'form_details', 'form_results')
ORDER BY tablename, policyname;

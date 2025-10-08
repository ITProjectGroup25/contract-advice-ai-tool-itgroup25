-- =============================================
-- Schema Verification Query
-- Compare results with schema-complete.sql
-- =============================================

-- 1. Count tables
SELECT 
    'Tables' as metric,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'

UNION ALL

-- 2. Count enum types
SELECT 
    'Enum Types' as metric,
    COUNT(DISTINCT t.typname) as count
FROM pg_type t 
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public' 
    AND t.typtype = 'e'

UNION ALL

-- 3. Count primary keys
SELECT 
    'Primary Keys' as metric,
    COUNT(*) as count
FROM information_schema.table_constraints
WHERE constraint_type = 'PRIMARY KEY' 
    AND table_schema = 'public'

UNION ALL

-- 4. Count foreign keys
SELECT 
    'Foreign Keys' as metric,
    COUNT(*) as count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' 
    AND table_schema = 'public'

UNION ALL

-- 5. Count unique constraints
SELECT 
    'Unique Constraints' as metric,
    COUNT(*) as count
FROM information_schema.table_constraints
WHERE constraint_type = 'UNIQUE' 
    AND table_schema = 'public'

UNION ALL

-- 6. Count indexes (excluding primary keys)
SELECT 
    'Indexes (non-PK)' as metric,
    COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname NOT LIKE '%_pkey'

UNION ALL

-- 7. Count sequences
SELECT 
    'Sequences' as metric,
    COUNT(*) as count
FROM information_schema.sequences
WHERE sequence_schema = 'public'

ORDER BY metric;

-- =============================================
-- Expected values from schema-complete.sql:
-- =============================================
-- Tables: 34
-- Enum Types: 21
-- Primary Keys: 33
-- Foreign Keys: 28
-- Unique Constraints: 13
-- Indexes (non-PK): 29
-- Sequences: 2
-- =============================================

-- Detailed table list verification
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

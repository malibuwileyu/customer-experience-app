-- Install pgTAP extension
CREATE EXTENSION IF NOT EXISTS pgtap;

-- Verify installation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_extension 
        WHERE extname = 'pgtap'
    ) THEN
        RAISE EXCEPTION 'pgTAP extension not installed';
    END IF;
END
$$; 
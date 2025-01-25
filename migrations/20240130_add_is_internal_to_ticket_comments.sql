-- Add is_internal column to ticket_comments
ALTER TABLE ticket_comments
ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing rows with default value
UPDATE ticket_comments SET is_internal = false WHERE is_internal IS NULL; 
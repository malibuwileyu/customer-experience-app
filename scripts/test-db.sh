#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Check required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ] || [ -z "$SUPABASE_DB_URL" ]; then
    echo "Error: SUPABASE_URL, SUPABASE_SERVICE_KEY, and SUPABASE_DB_URL must be set"
    echo "SUPABASE_DB_URL should be in format: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
    exit 1
fi

# Apply migrations
echo "Applying migrations..."
for migration in supabase/migrations/*.sql; do
    if [[ ! $migration =~ .*_rollback\.sql$ ]]; then
        echo "Applying $migration..."
        psql "$SUPABASE_DB_URL" -f "$migration"
    fi
done

# Run the tests using the Supabase connection
echo "Running database tests..."
pg_prove \
  --dbname "$SUPABASE_DB_URL" \
  --verbose \
  supabase/tests/*.test.sql 
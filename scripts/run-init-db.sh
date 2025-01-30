#!/bin/bash

# Load environment variables from .env
export $(cat .env | grep -v '^#' | xargs)

# Run the initialization script
NODE_OPTIONS="--loader ts-node/esm" npx ts-node --project scripts/tsconfig.json scripts/init-db.ts 
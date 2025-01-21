#!/bin/bash

# Remove unused React imports
find src -type f -name "*.tsx" -exec sed -i '/^import React from/d' {} +

# Remove other unused imports
files=(
  "src/__tests__/integration/supabase-auth.test.ts:AuthError"
  "src/__tests__/setup/test-users.ts:Permission"
  "src/components/common/form-input.tsx:FormFieldProps"
  "src/components/common/form-select.tsx:FormFieldProps"
  "src/components/common/form-textarea.tsx:FormFieldProps"
  "src/pages/DashboardPage.tsx:CardFooter"
  "src/pages/UnauthorizedPage.tsx:from"
  "src/pages/admin/RoleManagementPage.tsx:supabase,Button"
  "src/pages/auth/RegistrationPage.tsx:ControllerRenderProps"
  "src/services/role-management.service.ts:DatabasePermission"
  "src/utils/validation/schema.ts:UserRole"
)

for entry in "${files[@]}"; do
  IFS=: read -r file imports <<< "$entry"
  IFS=, read -ra import_array <<< "$imports"
  for import in "${import_array[@]}"; do
    sed -i "/${import}/d" "$file"
  done
done 
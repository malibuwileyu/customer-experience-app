/**
 * @fileoverview Label component built with Radix UI primitives
 * @module components/common/label
 * @description
 * An accessible label component built with Radix UI Label primitive.
 * Provides consistent styling and accessibility features for form inputs
 * and other interactive elements that require labels.
 */

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Label style variants using class-variance-authority
 * Defines the base styling for the label component with
 * support for disabled states through peer modifiers
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

/**
 * Label component for form controls and interactive elements
 * 
 * Features:
 * - Accessible label implementation
 * - Consistent styling with disabled states
 * - Peer-based styling for form controls
 * - Customizable through className prop
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <Label htmlFor="email">Email address</Label>
 * <Input id="email" type="email" />
 * 
 * // With disabled input
 * <Label htmlFor="disabled-input">Disabled field</Label>
 * <Input id="disabled-input" disabled />
 * 
 * // With custom styling
 * <Label className="text-primary">Custom label</Label>
 * ```
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label }; 
/**
 * @fileoverview Alert component for displaying important messages
 * @module components/common/alert
 * @description
 * A flexible alert component system built with class-variance-authority.
 * Provides styled alert boxes for displaying important messages, warnings,
 * or errors with consistent styling and accessibility features.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Alert style variants using class-variance-authority
 * Defines the available visual styles for the alert component
 */
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Alert component for displaying important messages
 * 
 * @component
 * @example
 * ```tsx
 * // Default alert
 * <Alert>
 *   <AlertDescription>
 *     Your changes have been saved successfully.
 *   </AlertDescription>
 * </Alert>
 * 
 * // Destructive alert
 * <Alert variant="destructive">
 *   <AlertDescription>
 *     Something went wrong. Please try again.
 *   </AlertDescription>
 * </Alert>
 * ```
 */
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

/**
 * Description component for the alert content
 * 
 * @component
 * @example
 * ```tsx
 * <Alert>
 *   <AlertDescription>
 *     This is the alert message with additional details
 *     that can span multiple lines if needed.
 *   </AlertDescription>
 * </Alert>
 * ```
 */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription }; 
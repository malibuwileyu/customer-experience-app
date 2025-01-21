/**
 * @fileoverview Dropdown menu component built with Radix UI primitives
 * @module components/common/dropdown-menu
 * @description
 * A fully accessible dropdown menu component system built with Radix UI primitives.
 * Provides a complete set of components for building custom dropdown menus with
 * consistent styling, animations, and accessibility features.
 */

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../../utils/cn";

/**
 * Root dropdown menu component that manages menu state
 * 
 * @component
 * @example
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Item 1</DropdownMenuItem>
 *     <DropdownMenuItem>Item 2</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */
const DropdownMenu = DropdownMenuPrimitive.Root;

/**
 * Button that triggers the dropdown menu
 * 
 * @component
 * @example
 * ```tsx
 * <DropdownMenuTrigger>
 *   Click to Open
 * </DropdownMenuTrigger>
 * ```
 */
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

/**
 * Container for dropdown menu items with positioning and animations
 * 
 * @component
 * @example
 * ```tsx
 * <DropdownMenuContent>
 *   <DropdownMenuItem>Option 1</DropdownMenuItem>
 *   <DropdownMenuItem>Option 2</DropdownMenuItem>
 * </DropdownMenuContent>
 * ```
 */
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

/**
 * Individual menu item component with hover and focus states
 * 
 * @component
 * @example
 * ```tsx
 * <DropdownMenuItem onSelect={() => console.log('Selected')}>
 *   Menu Option
 * </DropdownMenuItem>
 * ```
 */
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}; 
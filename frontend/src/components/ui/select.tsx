import * as React from "react"
import {
  Select as RadixSelect,
  SelectTrigger as RadixSelectTrigger,
  SelectValue as RadixSelectValue,
  SelectContent as RadixSelectContent,
  SelectItem as RadixSelectItem,
} from "@radix-ui/react-select"

import { cn } from "@/lib/utils"

export const Select = RadixSelect
export const SelectTrigger = RadixSelectTrigger
export const SelectValue = RadixSelectValue
export const SelectContent = RadixSelectContent

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof RadixSelectItem>,
  React.ComponentPropsWithoutRef<typeof RadixSelectItem>
>(({ className, children, ...props }, ref) => (
  <RadixSelectItem
    ref={ref}
    className={cn("px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100", className)}
    {...props}
  >
    {children}
  </RadixSelectItem>
))
SelectItem.displayName = "SelectItem"

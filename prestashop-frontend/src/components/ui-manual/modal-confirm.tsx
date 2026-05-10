import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { AlertDialog as AlertDialogPrimitive } from "radix-ui"
import type { Button } from "../ui/button";

export function ModalConfirm({
  title,
  description,
  trueName,
  falseName,
  onTrue,
  onFalse,
  icon,
  isOpen,
  falseButtonProps,
  trueButtonProps,
}: {
  title: string,
  description: string,
  trueName: string,
  falseName: string,
  onTrue: () => void,
  onFalse: () => void,
  icon?: React.ReactNode,
  isOpen: boolean,
  falseButtonProps?: React.ComponentProps<typeof AlertDialogPrimitive.Action> & Pick<React.ComponentProps<typeof Button>, "variant" | "size">,
  trueButtonProps?: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & Pick<React.ComponentProps<typeof Button>, "variant" | "size">,
}) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center">
          {icon && (
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              {icon}
            </div>
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onFalse} {...falseButtonProps}>
            {falseName}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onTrue} {...trueButtonProps}>
            {trueName}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
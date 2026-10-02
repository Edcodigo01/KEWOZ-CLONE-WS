import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CircleX, X } from "lucide-react";
import { cn } from "../../lib/utils";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  overlayClassName?: string;
  contentClassName?: string;
};

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = "md",
  showCloseButton = true,
  overlayClassName,
  contentClassName,
}: ModalProps) => {
  const sizeClasses = {
    sm: "max-w-full",
    md: "max-w-full",
    lg: "max-w-full",
    xl: "max-w-full",
    full: "w-full h-full m-0 rounded-none", // full screen
  };

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            // Softer blur backdrop
            "bg-secondary backdrop-blur-sm backdrop-saturate-200",
            // Fallback for browsers without backdrop-filter support
            "supports-[backdrop-filter]:bg-black/55 supports-[backdrop-filter]:backdrop-blur-sm",
            overlayClassName
          )}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <DialogPrimitive.Content
            className={cn(
              " relative z-50 grid w-auto  duration-200",
              // Plain solid background for modal content with border
              "bg-secondary shadow-2xl border border-table-divider",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[50%] rounded-2xl",
              "max-h-[90vh] overflow-hidden",
              sizeClasses[size],
              contentClassName
            )}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            {(title || showCloseButton) && (
              <div className="flex text-table-header-text items-center justify-center  rounded-xl py-4 shadow-lg ">
                {title && (
                  <DialogPrimitive.Title className="text-lg font-semibold">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {showCloseButton && (
                  <DialogPrimitive.Close
                    className="absolute top-5 right-3 rounded-sm font-bold transition-opacity hover:opacity-100 focus:outline-none  disabled:pointer-events-none"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <CircleX className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                )}
              </div>
            )}
            {/* {description && (
              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            )} */}
            <div className="overflow-y-auto max-h-[90vh] px-3 py-5">
              {children}
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

ModalHeader.displayName = "ModalHeader";
ModalFooter.displayName = "ModalFooter";
ModalTitle.displayName = "ModalTitle";
ModalDescription.displayName = "ModalDescription";

export { Modal, ModalHeader, ModalFooter, ModalTitle, ModalDescription };

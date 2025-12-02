You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
order-confirmation-card.tsx
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Your utility for merging class names
import { Button, ButtonProps } from "@/components/ui/button"; // Assuming shadcn Button

/**
 * @interface OrderConfirmationCardProps
 * @description Props for the OrderConfirmationCard component.
 * @property {string} orderId - The unique identifier for the order.
 * @property {string} paymentMethod - The method used for payment.
 * @property {string} dateTime - The date and time of the transaction.
 * @property {string} totalAmount - The total amount charged, formatted as a string (e.g., "$129").
 * @property {() => void} onGoToAccount - Callback function for the primary action button.
 * @property {string} [title] - Optional title text. Defaults to "Your order has been successfully submitted".
 * @property {string} [buttonText] - Optional text for the action button. Defaults to "Go to my account".
 * @property {React.ReactNode} [icon] - Optional custom icon. Defaults to a checkmark icon.
 * @property {string} [className] - Optional additional CSS classes for the card container.
 */
interface OrderConfirmationCardProps {
  orderId: string;
  paymentMethod: string;
  dateTime: string;
  totalAmount: string;
  onGoToAccount: () => void;
  title?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * A reusable UI component to display an order confirmation.
 * It's theme-adaptive, responsive, and includes subtle animations.
 */
export const OrderConfirmationCard: React.FC<OrderConfirmationCardProps> = ({
  orderId,
  paymentMethod,
  dateTime,
  totalAmount,
  onGoToAccount,
  title = "Your order has been successfully submitted",
  buttonText = "Go to my account",
  icon = <CheckCircle2 className="h-12 w-12 text-green-500" />,
  className,
}) => {
  // Array of details for easy mapping
  const details = [
    { label: "Order ID", value: orderId },
    { label: "Payment Method", value: paymentMethod },
    { label: "Date & Time", value: dateTime },
    { label: "Total", value: totalAmount, isBold: true },
  ];

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-live="polite"
        className={cn(
          "w-full max-w-sm rounded-xl border bg-card text-card-foreground shadow-lg p-6 sm:p-8",
          className
        )}
      >
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Success Icon */}
          <motion.div variants={itemVariants}>{icon}</motion.div>

          {/* Title */}
          <motion.h2 variants={itemVariants} className="text-2xl font-semibold">
            {title}
          </motion.h2>

          {/* Order Details Section */}
          <motion.div variants={itemVariants} className="w-full space-y-4 pt-4">
            {details.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between border-b pb-4 text-sm text-muted-foreground",
                  {
                    "border-none pb-0": index === details.length - 1, // No border for the last item
                    "font-bold text-card-foreground": item.isBold, // Bold style for Total
                  }
                )}
              >
                <span>{item.label}</span>
                <span className={cn({ "text-lg": item.isBold })}>{item.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Action Button */}
          <motion.div variants={itemVariants} className="w-full pt-4">
            <Button
              onClick={onGoToAccount}
              className="w-full h-12 text-md"
              size="lg"
            >
              {buttonText}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

demo.tsx
import React from "react";
import { OrderConfirmationCard } from "@/components/ui/order-confirmation-card";

/**
 * A demo component to showcase the OrderConfirmationCard.
 */
const OrderConfirmationCardDemo = () => {
  const handleGoToAccount = () => {
    // In a real app, this would navigate the user.
    alert("Navigating to your account...");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <OrderConfirmationCard
        orderId="57625869"
        paymentMethod="Apple Pay"
        dateTime="01/02/24 23:46"
        totalAmount="$ 129"
        onGoToAccount={handleGoToAccount}
      />
    </div>
  );
};

export default OrderConfirmationCardDemo;
```

Copy-paste these files for dependencies:
```tsx
shadcn/button
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

Install NPM dependencies:
```bash
lucide-react, framer-motion, @radix-ui/react-slot, class-variance-authority
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

import React from 'react';
import { clsx } from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        const variants = {
            primary: "bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-500)] shadow-lg shadow-blue-500/20 border border-transparent",
            secondary: "bg-[var(--color-accent-500)] text-[var(--color-brand-900)] hover:bg-[var(--color-accent-400)] font-semibold border border-transparent",
            outline: "bg-transparent border border-gray-200 text-[var(--color-text-main)] hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-600)]",
            ghost: "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]"
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-5 py-2.5 text-base",
            lg: "px-8 py-3.5 text-lg"
        };

        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-500)] disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {children as React.ReactNode}
            </motion.button>
        );
    }
);

Button.displayName = "Button";

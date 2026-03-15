/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
      secondary: "bg-stone-100 text-stone-900 hover:bg-stone-200",
      outline: "border border-stone-200 bg-white text-stone-900 hover:bg-stone-50",
      ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
      danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
        {children}
      </button>
    );
  }
);

export const Badge = ({
  className,
  children,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "neutral" | "success" | "warning" | "error" | "indigo";
}) => {
  const variants = {
    neutral: "bg-stone-100 text-stone-600 border-stone-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-red-50 text-red-700 border-red-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

interface ThemeToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isDark: boolean;
}

export const ThemeToggleButton = React.forwardRef<HTMLButtonElement, ThemeToggleButtonProps>(
  ({ className, isDark, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          isDark && "border-stone-600 bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-stone-50",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

interface DisclosureToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  controls?: string;
  className?: string;
}

export const DisclosureToggle = ({
  isOpen,
  onToggle,
  label = "Advanced options",
  icon,
  controls,
  className,
  ...props
}: DisclosureToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      "flex items-center gap-1.5 rounded-md px-1 text-xs font-medium text-stone-600 transition-colors hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
      className
    )}
    aria-expanded={isOpen}
    aria-controls={controls}
    {...props}
  >
    {icon}
    {label}
    {isOpen
      ? <ChevronUp className="h-3 w-3" aria-hidden="true" />
      : <ChevronDown className="h-3 w-3" aria-hidden="true" />}
  </button>
);

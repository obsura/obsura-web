/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-strong)] shadow-sm",
      secondary: "bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--bg-subtle)_82%,var(--line-subtle)_18%)]",
      outline: "border border-[var(--line-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]",
      ghost: "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]",
      danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60",
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
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)] disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("surface rounded-xl overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export const Badge = ({ className, children, variant = "neutral", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "neutral" | "success" | "warning" | "error" | "indigo" }) => {
  const variants = {
    neutral: "bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--line-subtle)]",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-red-50 text-red-700 border-red-100",
    indigo: "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/60",
  };

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider", variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export const SectionHeading = ({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      {subtitle ? <p className="text-xs text-[var(--text-muted)]">{subtitle}</p> : null}
    </div>
  );
};

export const Divider = ({ className }: { className?: string }) => (
  <div className={cn("h-px w-full bg-[var(--line-subtle)]", className)} aria-hidden="true" />
);

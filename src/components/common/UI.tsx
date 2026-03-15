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
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
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
  <div className={cn("bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export const Badge = ({ className, children, variant = "neutral", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "neutral" | "success" | "warning" | "error" | "indigo" }) => {
  const variants = {
    neutral: "bg-stone-100 text-stone-600 border-stone-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-red-50 text-red-700 border-red-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider", variants[variant], className)} {...props}>
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
          "h-8 w-8 rounded-md border border-stone-200 bg-white text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
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

export const FieldLabel = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-xs font-medium text-stone-600", className)} {...props}>
    {children}
  </label>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow",
      className
    )}
    {...props}
  />
));

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow",
      className
    )}
    {...props}
  />
));

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow",
      className
    )}
    {...props}
  >
    {children}
  </select>
));

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "w-4 h-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 transition-colors",
      className
    )}
    {...props}
  />
));

interface FormFieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}

export const FormField = ({ label, hint, className, labelClassName, children }: FormFieldProps) => (
  <div className={cn("space-y-1.5", className)}>
    <FieldLabel className={labelClassName}>{label}</FieldLabel>
    {children}
    {hint ? <p className="text-[11px] text-stone-500">{hint}</p> : null}
  </div>
);

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export const SegmentedControl = <T extends string>({ value, options, onChange, className }: SegmentedControlProps<T>) => {
  return (
    <div className={cn("inline-flex p-1 bg-stone-200/50 rounded-xl border border-stone-200", className)} role="tablist" aria-orientation="horizontal">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all",
              isActive ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

interface PanelHeaderProps {
  title: React.ReactNode;
  titleId?: string;
  actions?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const PanelHeader = ({ title, titleId, actions, className, titleClassName }: PanelHeaderProps) => (
  <div className={cn("flex items-center justify-between", className)}>
    <h3 id={titleId} className={cn("text-sm font-semibold text-stone-900", titleClassName)}>
      {title}
    </h3>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </div>
);

type MetaPillProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "accent";
};

export const MetaPill = ({ children, tone = "neutral", className, ...props }: MetaPillProps) => (
  <span
    {...props}
    className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium",
      tone === "accent" ? "bg-indigo-50 text-indigo-700" : "bg-stone-100 text-stone-700",
      className
    )}
  >
    {children}
  </span>
);

export const StatusMeta = ({
  children,
  trailing,
  className,
}: {
  children?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-wrap items-center gap-2 mt-2 pl-1", className)} aria-live="polite">
    {children}
    {trailing ? <div className="ml-auto text-[10px] font-mono text-stone-400 select-all">{trailing}</div> : null}
  </div>
);

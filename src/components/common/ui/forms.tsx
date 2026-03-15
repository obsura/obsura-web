/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { cn } from "../../../lib/utils";

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
      "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition-shadow placeholder:text-stone-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500",
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
      "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition-shadow placeholder:text-stone-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500",
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
      "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition-shadow focus:border-transparent focus:ring-2 focus:ring-indigo-500",
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
    className={cn("h-4 w-4 rounded border-stone-300 text-indigo-600 transition-colors focus:ring-indigo-500", className)}
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

type CheckboxFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: React.ReactNode;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
};

export const CheckboxField = ({
  label,
  className,
  labelClassName,
  inputClassName,
  ...props
}: CheckboxFieldProps) => (
  <label className={cn("group flex cursor-pointer items-center gap-3", props.disabled && "opacity-50", className)}>
    <Checkbox className={inputClassName} {...props} />
    <span
      className={cn(
        "text-sm text-stone-700 transition-colors group-hover:text-stone-900",
        props.disabled && "text-stone-500",
        labelClassName
      )}
    >
      {label}
    </span>
  </label>
);

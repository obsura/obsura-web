/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { cn } from "../../../lib/utils";

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
    <div className={cn("inline-flex rounded-xl border border-stone-200 bg-stone-200/50 p-1", className)} role="tablist" aria-orientation="horizontal">
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
              "flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold transition-all",
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

type SettingsSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  title: React.ReactNode;
};

export const SettingsSection = ({ title, className, children, ...props }: SettingsSectionProps) => (
  <div className={cn("space-y-4", className)} {...props}>
    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{title}</h4>
    {children}
  </div>
);

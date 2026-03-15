/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { cn } from "../../../lib/utils";

type MetaPillProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "accent";
};

export const MetaPill = ({ children, tone = "neutral", className, ...props }: MetaPillProps) => (
  <span
    {...props}
    className={cn(
      "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium",
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
  <div className={cn("mt-2 flex flex-wrap items-center gap-2 pl-1", className)} aria-live="polite">
    {children}
    {trailing ? <div className="ml-auto select-all font-mono text-[10px] text-stone-400">{trailing}</div> : null}
  </div>
);

type PanelStateProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  tone?: "neutral" | "error";
  animated?: boolean;
};

export const PanelState = ({
  icon,
  title,
  description,
  tone = "neutral",
  animated = false,
  className,
  ...props
}: PanelStateProps) => (
  <div
    className={cn(
      "flex h-full flex-col items-center justify-center space-y-2 p-4 text-center",
      tone === "error" ? "text-red-500" : "text-stone-400",
      animated && "animate-pulse",
      className
    )}
    {...props}
  >
    {icon ? <div className="flex items-center justify-center">{icon}</div> : null}
    {title ? <p className={cn("text-xs font-medium", tone === "error" ? "text-red-500" : "text-stone-600")}>{title}</p> : null}
    {description ? <p className="max-w-sm text-xs">{description}</p> : null}
  </div>
);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { cn } from "../../../lib/utils";

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm", className)} {...props}>
    {children}
  </div>
);

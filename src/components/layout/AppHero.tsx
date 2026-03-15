/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck } from "lucide-react";

export const AppHero = () => {
  return (
    <div className="space-y-3 text-center">
      <div
        className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700"
        aria-hidden="true"
      >
        <ShieldCheck className="h-3 w-3" />
        Privacy First Redaction
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 md:text-4xl">Reduct sensitive PII in seconds.</h2>
      <p className="mx-auto max-w-2xl text-base text-stone-500 md:text-lg">
        Obsura helps you safely share documents and screenshots by automatically redacting PII, secrets, and sensitive
        information.
      </p>
    </div>
  );
};

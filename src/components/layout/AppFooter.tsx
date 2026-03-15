/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeveloperProfile } from "./DeveloperProfile";

const legalLinks = [
  { href: "/privacy-policy.html", label: "Privacy Policy" },
  { href: "/security-audit.html", label: "Security Audit" },
  { href: "/terms-of-service.html", label: "Terms of Service" },
];

export const AppFooter = () => {
  return (
    <footer className="pt-6 pb-2">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-[11px] text-stone-400">
          &copy; 2026 Obsura Project. Created with &hearts; by <DeveloperProfile />.
        </p>
        <div className="flex items-center gap-6">
          {legalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm text-[11px] font-medium text-stone-500 underline-offset-4 transition-colors hover:text-stone-900 hover:underline focus-visible:text-stone-900 focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

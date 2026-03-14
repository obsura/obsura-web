import React from "react";
import { Github, Mail, Phone, Code2 } from "lucide-react";

export const DeveloperProfile = () => {
  return (
    <span className="relative inline-block group">
      <a 
        href="https://github.com/elqabasy" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="font-mono font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-strong)] transition-colors relative cursor-help"
      >
        0xQ4B4S
        <span className="absolute -bottom-0.5 left-0 w-full h-[1px] bg-[color-mix(in_srgb,var(--brand-primary)_50%,white_50%)] border-dashed border-b border-[var(--brand-primary)] group-hover:border-solid transition-all"></span>
      </a>
      
      {/* Popover Card */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 bg-[var(--bg-surface)] border border-[var(--line-subtle)] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 origin-bottom scale-95 group-hover:scale-100">
        
        {/* Pointer Triangle */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--bg-surface)] border-b border-r border-[var(--line-subtle)] rotate-45"></div>

        <div className="flex items-start gap-4">
          <img
            src="https://github.com/elqabasy.png"
            alt="Mahros"
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--line-subtle)] shadow-sm"
            loading="lazy"
          />
          <div className="flex-1 text-left">
            <h4 className="text-sm font-bold text-[var(--text-primary)] leading-tight">Mahros</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <Code2 className="w-3 h-3 text-[var(--brand-primary)]" aria-hidden="true" />
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">Computer Science Student</span>
            </div>
          </div>
        </div>
        
        <p className="mt-3.5 text-xs text-[var(--text-secondary)] leading-[1.6] text-left">
          Passionate about developing secure, user-friendly software solutions. 
          Active in competitive problem-solving and a dedicated CTF player.
        </p>
        
        <div className="mt-4 pt-3 border-t border-[var(--line-subtle)]/80 flex flex-col gap-2.5">
          <a href="mailto:mahros.elqabasy@gmail.com" className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit">
            <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" /> mahros.elqabasy@gmail.com
          </a>
          <a href="tel:+201015888272" className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit">
            <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" /> +20 101 588 8272
          </a>
          <a href="https://github.com/elqabasy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit">
            <Github className="w-3.5 h-3.5 text-[var(--text-muted)]" /> @elqabasy
          </a>
        </div>
      </div>
    </span>
  );
};

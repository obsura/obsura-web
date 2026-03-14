import React from "react";
import { Github, Mail, Phone, Code2 } from "lucide-react";

export const DeveloperProfile = () => {
  return (
    <span className="relative inline-block group">
      <a 
        href="https://github.com/elqabasy" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="font-mono font-medium text-indigo-600 hover:text-indigo-700 transition-colors relative cursor-help"
      >
        0xQ4B4S
        <span className="absolute -bottom-0.5 left-0 w-full h-[1px] bg-indigo-300 border-dashed border-b border-indigo-400 group-hover:border-solid transition-all"></span>
      </a>
      
      {/* Popover Card */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 bg-white border border-stone-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 origin-bottom scale-95 group-hover:scale-100">
        
        {/* Pointer Triangle */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-stone-200 rotate-45"></div>

        <div className="flex items-start gap-4">
          <img
            src="https://github.com/elqabasy.png"
            alt="Mahros"
            className="w-14 h-14 rounded-full object-cover ring-2 ring-stone-100 shadow-sm"
            loading="lazy"
          />
          <div className="flex-1 text-left">
            <h4 className="text-sm font-bold text-stone-900 leading-tight">Mahros</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <Code2 className="w-3 h-3 text-indigo-500" aria-hidden="true" />
              <span className="text-[11px] font-medium text-stone-500">Computer Science Student</span>
            </div>
          </div>
        </div>
        
        <p className="mt-3.5 text-xs text-stone-500 leading-[1.6] text-left">
          Passionate about developing secure, user-friendly software solutions. 
          Active in competitive problem-solving and a dedicated CTF player.
        </p>
        
        <div className="mt-4 pt-3 border-t border-stone-100/80 flex flex-col gap-2.5">
          <a href="mailto:mahros.elqabasy@gmail.com" className="flex items-center gap-2.5 text-xs text-stone-500 hover:text-stone-900 transition-colors w-fit">
            <Mail className="w-3.5 h-3.5 text-stone-400" /> mahros.elqabasy@gmail.com
          </a>
          <a href="tel:+201015888272" className="flex items-center gap-2.5 text-xs text-stone-500 hover:text-stone-900 transition-colors w-fit">
            <Phone className="w-3.5 h-3.5 text-stone-400" /> +20 101 588 8272
          </a>
          <a href="https://github.com/elqabasy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-stone-500 hover:text-stone-900 transition-colors w-fit">
            <Github className="w-3.5 h-3.5 text-stone-400" /> @elqabasy
          </a>
        </div>
      </div>
    </span>
  );
};

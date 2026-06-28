import React, { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Settings } from "lucide-react";

interface SectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Section({
  title,
  icon,
  children,
  defaultOpen = true,
}: SectionProps): React.ReactElement {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#202020]">
      <div className="flex items-center w-full bg-[#3e3e3e] border-t border-[#4a4a4a] border-b border-[#1a1a1a] select-none">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-center w-[16px] h-[20px] text-[#aaa] hover:text-[#eee]"
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <div className="flex items-center gap-1 px-1 h-[20px] flex-1">
          <input
            type="checkbox"
            defaultChecked
            className="accent-[#2C5D87] w-[11px] h-[11px] m-0 mr-1"
          />
          {icon !== undefined && (
            <span className="text-[#ccc] opacity-80">{icon}</span>
          )}
          <span className="text-[11px] text-[#eee] font-bold">{title}</span>
        </div>
        <button className="px-2 text-[#aaa] hover:text-[#eee]">
          <Settings size={11} />
        </button>
      </div>
      {open && (
        <div className="px-3 py-2 space-y-[4px] bg-[#383838]">{children}</div>
      )}
    </div>
  );
}

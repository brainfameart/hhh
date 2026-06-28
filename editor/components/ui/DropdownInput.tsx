import React from "react";
import { ChevronDown } from "lucide-react";

interface DropdownInputProps {
  value?: string;
  options: readonly string[];
  onChange?: (value: string) => void;
}

export function DropdownInput({ value, options, onChange }: DropdownInputProps): React.ReactElement {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full appearance-none bg-[#2a2a2a] border border-[#202020] rounded-[2px] px-1.5 py-[1px] text-[11px] text-[#eee] outline-none hover:border-[#444]"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown
        size={10}
        className="absolute right-1 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none"
      />
    </div>
  );
}

import React from "react";

interface NumInputProps {
  label?: string;
  value: number;
  onChange?: (value: number) => void;
}

export function NumInput({ label, value, onChange }: NumInputProps): React.ReactElement {
  return (
    <div className="flex items-center gap-0.5 flex-1 min-w-0 bg-[#2a2a2a] border border-[#202020] rounded-[2px] hover:border-[#444] focus-within:border-[#2C5D87] overflow-hidden">
      {label !== undefined && label !== "" && (
        <span className="text-[10px] text-[#888] font-bold w-3 shrink-0 text-center select-none cursor-ew-resize">
          {label}
        </span>
      )}
      <input
        type="number"
        value={onChange ? parseFloat(value.toFixed(3)) : undefined}
        defaultValue={onChange ? undefined : value}
        step={0.1}
        onChange={(e) => onChange?.(e.target.valueAsNumber)}
        className="flex-1 w-full bg-transparent px-1 py-[1px] text-[11px] text-[#eee] outline-none font-mono"
      />
    </div>
  );
}

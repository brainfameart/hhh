import React from "react";
import { Info } from "lucide-react";

export function StatusBar(): React.ReactElement {
  return (
    <div className="h-[22px] bg-[#282828] border-t border-[#1a1a1a] flex items-center justify-between px-2 text-[10px] text-[#aaa] shrink-0">
      <div className="flex items-center gap-2">
        <Info size={12} className="text-[#ccc]" />
        <span>Auto-save completed.</span>
      </div>
      <div className="flex items-center gap-4 text-[#888]">
        <span>Memory: 142 MB</span>
        <span className="font-mono">Zengine v0.1.0</span>
      </div>
    </div>
  );
}

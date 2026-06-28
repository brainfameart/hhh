import React, { type ReactNode } from "react";

interface RowProps {
  label: string;
  children: ReactNode;
}

export function Row({ label, children }: RowProps): React.ReactElement {
  return (
    <div className="flex items-start gap-1 w-full">
      <span className="text-[#ccc] text-[11px] w-[35%] shrink-0 pt-[2px] truncate select-none">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

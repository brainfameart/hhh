import React, { type ReactNode } from "react";

interface TabBtnProps {
  active: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  label: string;
  right?: ReactNode;
}

export function TabBtn({ active, onClick, icon, label, right }: TabBtnProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={[
        "h-[22px] px-3 flex items-center gap-1.5 text-[11px] select-none",
        "border-r border-[#1a1a1a] relative",
        active
          ? "bg-[#383838] text-[#eee]"
          : "bg-[#282828] text-[#aaa] hover:text-[#eee]",
      ].join(" ")}
    >
      {active && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#2C5D87]" />
      )}
      {icon}
      <span>{label}</span>
      {right}
    </button>
  );
}

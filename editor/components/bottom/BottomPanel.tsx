import React, { useState } from "react";
import { Folder, Terminal, AlertTriangle } from "lucide-react";
import { INITIAL_LOGS } from "../../../shared/constants/data";
import { TabBtn } from "../ui/TabBtn";
import { ProjectTab } from "./ProjectTab";
import { ConsoleTab } from "./ConsoleTab";
import type { SpriteAsset } from "../../../shared/types/engine";

interface BottomPanelProps {
  spriteAssets: SpriteAsset[];
}

type BottomTab = "project" | "console";

export function BottomPanel({ spriteAssets }: BottomPanelProps): React.ReactElement {
  const [tab, setTab] = useState<BottomTab>("project");

  const errCount  = INITIAL_LOGS.filter((l) => l.type === "error").length;
  const warnCount = INITIAL_LOGS.filter((l) => l.type === "warn").length;

  const consoleBadge =
    errCount > 0 || warnCount > 0 ? (
      <div className="flex gap-1 ml-2 text-[10px]">
        {errCount > 0 && (
          <span className="flex items-center gap-0.5 text-[#ff6b6b]">
            <AlertTriangle size={10} /> {errCount}
          </span>
        )}
        {warnCount > 0 && (
          <span className="flex items-center gap-0.5 text-[#feca57]">
            <AlertTriangle size={10} /> {warnCount}
          </span>
        )}
      </div>
    ) : undefined;

  return (
    <div className="flex flex-col bg-[#383838] h-full border-t border-[#1a1a1a]">
      {/* Tab bar */}
      <div className="flex bg-[#282828] border-b border-[#1a1a1a]">
        <TabBtn
          active={tab === "project"}
          onClick={() => setTab("project")}
          icon={<Folder size={12} />}
          label="Project"
        />
        <TabBtn
          active={tab === "console"}
          onClick={() => setTab("console")}
          icon={<Terminal size={12} />}
          label="Console"
          right={consoleBadge}
        />
      </div>

      {tab === "project" && <ProjectTab spriteAssets={spriteAssets} />}
      {tab === "console" && <ConsoleTab />}
    </div>
  );
}

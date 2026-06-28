import React, { useState } from "react";
import { ChevronDown, Camera, Plus, Search, ListTree, Image } from "lucide-react";
import type { EntityId, Entity } from "../../../shared/types/engine";
import { TabBtn } from "../ui/TabBtn";

interface HierarchyPanelProps {
  selectedId: EntityId | null;
  setSelectedId: (id: EntityId | null) => void;
  entities: Entity[];
}

export function HierarchyPanel({
  selectedId,
  setSelectedId,
  entities,
}: HierarchyPanelProps): React.ReactElement {
  const [filter, setFilter] = useState("");

  const visible = entities.filter(
    (e) => filter.trim() === "" || e.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#383838]">
      <div className="flex items-center bg-[#282828] border-b border-[#1a1a1a]">
        <TabBtn active label="Hierarchy" icon={<ListTree size={12} />} />
      </div>

      <div className="flex items-center gap-1 p-1 border-b border-[#202020]">
        <button className="flex items-center gap-1 text-[11px] text-[#ccc] hover:bg-[#444] px-1 py-[2px] rounded border border-transparent hover:border-[#333]">
          <Plus size={12} /> <ChevronDown size={10} />
        </button>
        <div className="flex flex-1 items-center bg-[#2a2a2a] border border-[#202020] rounded-[8px] px-2 h-[18px]">
          <Search size={10} className="text-[#888] mr-1 shrink-0" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent outline-none text-[11px] text-[#eee] w-full"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#383838] py-1 select-none">
        <div className="flex items-center px-1 py-[2px] text-[#eee] hover:bg-[#444] cursor-pointer group">
          <ChevronDown size={12} className="text-[#aaa] mr-0.5" />
          <span className="text-[11px] font-bold">Main Scene</span>
        </div>

        {visible.map((entity) => (
          <div
            key={entity.id}
            onClick={() => setSelectedId(entity.id)}
            className={[
              "flex items-center pl-5 pr-2 py-[2px] cursor-pointer transition-colors",
              selectedId === entity.id
                ? "bg-[#2C5D87] text-white"
                : "text-[#ccc] hover:bg-[#444]",
            ].join(" ")}
          >
            <span className="w-[12px] h-[12px] mr-1 flex items-center justify-center shrink-0">
              {entity.hasCamera ? (
                <Camera size={11} className={selectedId === entity.id ? "text-white" : "text-[#aaa]"} />
              ) : (
                <Image size={11} className={selectedId === entity.id ? "text-white" : "text-[#7a9eff]"} />
              )}
            </span>
            <span className="text-[11px] truncate leading-tight">{entity.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

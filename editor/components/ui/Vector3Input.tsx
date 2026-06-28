import React from "react";
import { NumInput } from "./NumInput";

interface Vector3InputProps {
  x?: number;
  y?: number;
  z?: number;
  onChangeX?: (v: number) => void;
  onChangeY?: (v: number) => void;
  onChangeZ?: (v: number) => void;
}

export function Vector3Input({
  x = 0,
  y = 0,
  z = 0,
  onChangeX,
  onChangeY,
  onChangeZ,
}: Vector3InputProps): React.ReactElement {
  return (
    <div className="flex items-center gap-1 w-full">
      <NumInput label="X" value={x} onChange={onChangeX} />
      <NumInput label="Y" value={y} onChange={onChangeY} />
      <NumInput label="Z" value={z} onChange={onChangeZ} />
    </div>
  );
}

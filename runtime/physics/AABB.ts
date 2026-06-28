// ─── Physics: AABB ───────────────────────────────────────────────────────────
// Pure TypeScript — no DOM, no React.

export interface AABB {
  readonly x: number;  // left
  readonly y: number;  // top
  readonly width: number;
  readonly height: number;
}

export function aabbOverlaps(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** Returns the minimum translation vector to separate two overlapping AABBs, or null. */
export function aabbMTV(
  a: AABB,
  b: AABB
): { dx: number; dy: number } | null {
  if (!aabbOverlaps(a, b)) return null;

  const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

  if (overlapX < overlapY) {
    const dir = a.x < b.x ? -1 : 1;
    return { dx: overlapX * dir, dy: 0 };
  } else {
    const dir = a.y < b.y ? -1 : 1;
    return { dx: 0, dy: overlapY * dir };
  }
}

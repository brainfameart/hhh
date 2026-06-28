import type { Entity, EntityId } from "../types/engine";

/** Find an entity by id, returns undefined (not null) so callers handle it strictly. */
export function findEntityById(
  entities: readonly Entity[],
  id: EntityId
): Entity | undefined {
  return entities.find((e) => e.id === id);
}

/** Filter entities by a search string (case-insensitive name match). */
export function filterEntities(
  entities: readonly Entity[],
  query: string
): readonly Entity[] {
  if (query.trim() === "") return entities;
  const lower = query.toLowerCase();
  return entities.filter((e) => e.name.toLowerCase().includes(lower));
}

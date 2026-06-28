import { useState, useRef, useEffect, type RefObject } from "react";

interface UseDropdownReturn {
  open: boolean;
  setOpen: (val: boolean) => void;
  ref: RefObject<HTMLDivElement>;
}

/** Auto-closes a dropdown when clicking outside the ref element. */
export function useDropdown(): UseDropdownReturn {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent): void => {
      if (ref.current !== null && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return { open, setOpen, ref };
}

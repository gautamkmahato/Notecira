"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, MoreHorizontal } from "lucide-react";

type DocumentCardMenuProps = {
  documentId: string;
  title: string;
};

export function DocumentCardMenu({ documentId, title }: DocumentCardMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const href = `/documents?doc=${encodeURIComponent(documentId)}`;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white/90"
        aria-label={`Actions for ${title}`}
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-xl border border-white/10 bg-[#25282b] py-1 shadow-xl"
          role="menu"
        >
          <Link
            href={href}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Open
          </Link>
        </div>
      )}
    </div>
  );
}

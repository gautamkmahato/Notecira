import { Suspense } from "react";
import { Workspace } from "@/components/Workspace";

export default function DocumentsPage() {
  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
            Loading workspace…
          </div>
        }
      >
        <Workspace />
      </Suspense>
    </main>
  );
}

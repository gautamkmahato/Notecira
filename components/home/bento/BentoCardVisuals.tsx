import type { ReactNode } from "react";
import {
  ChevronDown,
  Copy,
  Eye,
  Folder,
  Home,
  Link2,
  Pencil,
  Plus,
  Star,
  Trash2,
  User,
} from "lucide-react";

/** Shared sky panel inside each bento card */
export function BentoSkyPanel({
  children,
  className = "",
  minHeight = "min-h-[168px]",
}: {
  children: ReactNode;
  className?: string;
  minHeight?: string;
}) {
  return (
    <div
      className={`relative mx-3 mt-3 overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_28%,_#f8fcff_0%,_#d4ebf7_52%,_#bdd9ef_100%)] px-3 pb-3 pt-4 sm:mx-4 sm:mt-4 sm:px-4 ${minHeight} ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden
      />
      <div className="relative flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function WorkspaceVisual() {
  return (
    <div className="relative w-full max-w-[340px] px-1">
      <div
        className="flex h-[132px] overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.1)]"
      >
        <aside
          className="flex w-11 shrink-0 flex-col items-center gap-2.5 border-r border-[#f1f5f9] bg-[#f8fafc] py-3"
        >
          <Home className="h-3.5 w-3.5 text-[#64748b]" strokeWidth={2} />
          <Folder className="h-3.5 w-3.5 text-[#2563eb]" strokeWidth={2} />
          <Star className="h-3.5 w-3.5 text-[#94a3b8]" strokeWidth={2} />
          <Trash2 className="h-3.5 w-3.5 text-[#94a3b8]" strokeWidth={2} />
        </aside>
        <div className="min-w-0 flex-1 p-2.5">
          <div className="mb-2 h-2 w-16 rounded bg-[#e2e8f0]" />
          {["Product specs", "Meeting notes", "Research"].map((label, i) => (
            <div
              key={label}
              className={`mb-1.5 flex items-center gap-2 rounded-lg px-1.5 py-1.5 ${i === 0 ? "bg-[#eff6ff]" : ""}`}
            >
              <Folder
                className={`h-3.5 w-3.5 shrink-0 ${i === 0 ? "text-[#2563eb]" : "text-[#94a3b8]"}`}
                strokeWidth={2}
              />
              <span className="truncate text-[10px] font-medium text-[#334155]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        className="absolute -left-0.5 bottom-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563eb] text-white shadow-md"
      >
        <Folder className="h-4 w-4" strokeWidth={2} fill="currentColor" />
      </div>
      <div
        className="absolute -right-0.5 bottom-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563eb] text-white shadow-md"
      >
        <Copy className="h-4 w-4" strokeWidth={2} />
      </div>
    </div>
  );
}

const BLOCK_NODES = [
  {
    label: "Work",
    className: "left-[8%] top-[18%] bg-[#ede9fe] text-[#6d28d9] border-[#ddd6fe]",
  },
  {
    label: "Canvas",
    className: "right-[10%] top-[12%] bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]",
  },
  {
    label: "Nested",
    className: "left-[14%] bottom-[16%] bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]",
  },
  {
    label: "Starred",
    className: "right-[14%] bottom-[14%] bg-[#ffedd5] text-[#c2410c] border-[#fed7aa]",
  },
];

export function BlocksCanvasVisual() {
  return (
    <div className="relative h-[150px] w-full max-w-[300px]">
      <svg
        className="absolute inset-0 h-full w-full text-[#60a5fa]"
        viewBox="0 0 300 150"
        fill="none"
        aria-hidden
      >
        <path
          d="M 70 55 Q 150 20 220 48"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 220 48 Q 200 95 235 115"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 70 55 Q 95 100 80 118"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 80 118 Q 160 130 235 115"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {BLOCK_NODES.map((node) => (
        <div
          key={node.label}
          className={`absolute rounded-xl border px-2.5 py-1.5 text-[10px] font-semibold shadow-sm ${node.className}`}
        >
          {node.label}
        </div>
      ))}
      <div
        className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[#2563eb] text-white shadow-md"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </div>
    </div>
  );
}

const SPACE_ITEMS = [
  { label: "Specs", icon: "text-[#7c3aed]", bg: "bg-[#f5f3ff]" },
  { label: "Notes", icon: "text-[#0ea5e9]", bg: "bg-[#f0f9ff]" },
  { label: "Drafts", icon: "text-[#f59e0b]", bg: "bg-[#fffbeb]" },
  { label: "Archive", icon: "text-[#10b981]", bg: "bg-[#ecfdf5]" },
];

export function SpacesVisual() {
  return (
    <div className="grid w-full max-w-[210px] grid-cols-2 gap-2.5">
      {SPACE_ITEMS.map((item) => (
        <div
          key={item.label}
          className={`flex flex-col items-center rounded-xl border border-[#e8eef3] bg-white px-2 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.07)] ${item.bg}`}
        >
          <Folder className={`h-5 w-5 ${item.icon}`} strokeWidth={1.75} />
          <span className="mt-1.5 text-[10px] font-semibold text-[#475569]">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function NestedColumnsVisual() {
  return (
    <div className="relative flex w-full max-w-[240px] items-end gap-2 pt-4">
      <div
        className="relative h-[100px] flex-[1.15] rounded-lg border border-[#e2e8f0] bg-white p-2 shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
      >
        <div className="space-y-1.5">
          <div className="h-1.5 w-3/4 rounded bg-[#cbd5e1]" />
          <div className="h-1.5 w-full rounded bg-[#e2e8f0]" />
          <div className="h-1.5 w-5/6 rounded bg-[#f1f5f9]" />
          <div className="mt-2 h-8 rounded border border-dashed border-[#cbd5e1] bg-[#f8fafc]" />
        </div>
      </div>
      <div
        className="h-[78px] flex-[0.65] rounded-lg border border-[#e2e8f0] bg-white p-1.5 shadow-[0_6px_16px_rgba(15,23,42,0.06)]"
      >
        <div className="space-y-1">
          <div className="h-1 w-full rounded bg-[#e2e8f0]" />
          <div className="h-1 w-4/5 rounded bg-[#f1f5f9]" />
          <div className="h-6 rounded bg-[#eff6ff]" />
        </div>
      </div>
      <div
        className="absolute left-1/2 top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-[#0f172a] text-white shadow-lg ring-4 ring-[#d4ebf7]/80"
      >
        <Eye className="h-3.5 w-3.5" strokeWidth={2.25} />
      </div>
    </div>
  );
}

export function ShareLinksVisual() {
  return (
    <div className="flex w-full max-w-[200px] flex-col items-center gap-2.5 py-1">
      <div
        className="flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-[10px] font-medium text-[#475569] shadow-sm"
      >
        <User className="h-3 w-3 text-[#64748b]" strokeWidth={2} />
        Anyone with the link
      </div>
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-[0_10px_24px_rgba(37,99,235,0.35)]"
      >
        <Link2 className="h-5 w-5" strokeWidth={2.25} />
      </div>
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-[10px] font-medium text-[#475569] shadow-sm"
      >
        <Pencil className="h-3 w-3 text-[#64748b]" strokeWidth={2} />
        Can edit
        <ChevronDown className="h-3 w-3 text-[#94a3b8]" strokeWidth={2} />
      </button>
    </div>
  );
}

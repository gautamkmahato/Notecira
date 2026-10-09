"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
} from "lucide-react";
import {
  getActiveCanvas,
  useActiveCanvas,
} from "@/lib/canvas-block/active-canvas";
import {
  isShapeElement,
  isTextLikeElement,
} from "@/lib/canvas-block/element-meta";
import {
  CANVAS_HAND_FONT,
  type CanvasStrokeStyle,
  type CanvasTextAlign,
} from "@/lib/canvas-block/types";
import { useDocumentStore } from "@/lib/document-store";
import { ToolbarDivider } from "@/lib/editor/toolbar/components/toolbar-divider";
import { CanvasPanelSelect } from "@/components/canvas-block/CanvasPanelSelect";

type CanvasSelectionSubToolbarProps = {
  blockId: string | null;
  layout?: "horizontal" | "vertical" | "floating";
  className?: string;
  style?: CSSProperties;
};

function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-mid-gray)]">
      {children}
    </span>
  );
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 30, 32, 36, 48];
const FONT_SIZE_S = 18;
const FONT_SIZE_M = 24;
const FONT_SIZE_L = 30;

const STROKE_COLOR_PRESETS = [
  "#1e293b",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
];
const FILL_COLOR_PRESETS = [
  "transparent",
  "#ffc9c9",
  "#b2f2bb",
  "#a5d8ff",
  "#ffec99",
];
const COLOR_SWATCHES = [
  ...STROKE_COLOR_PRESETS,
  "#9333ea",
];
const STROKE_WIDTH_PRESETS = [1, 2, 4];
const STROKE_STYLES: CanvasStrokeStyle[] = ["solid", "dashed", "dotted"];

const CANVAS_FONT_NUNITO = '"Nunito", sans-serif';
const CANVAS_FONT_COMIC = '"Comic Sans MS", "Comic Neue", cursive';

const TEXT_FONT_FAMILIES: {
  label: string;
  value: string;
  previewStyle?: CSSProperties;
}[] = [
  { label: "Hand", value: CANVAS_HAND_FONT, previewStyle: { fontFamily: CANVAS_HAND_FONT } },
  { label: "Nunito", value: CANVAS_FONT_NUNITO, previewStyle: { fontFamily: CANVAS_FONT_NUNITO } },
  { label: "Comic", value: CANVAS_FONT_COMIC, previewStyle: { fontFamily: CANVAS_FONT_COMIC } },
];

function fontSizeDropdownOptions(currentSize: number) {
  const sizes = new Set([...FONT_SIZES, currentSize]);
  return Array.from(sizes)
    .sort((a, b) => a - b)
    .map((size) => ({
      value: String(size),
      label: String(size),
    }));
}

/** 52px × 3 − 10% */
const FLOATING_PANEL_WIDTH_CLASS = "w-[168px]";

function ToggleBtn({
  active,
  label,
  title,
  onClick,
  compact,
}: {
  active: boolean;
  label: string;
  title: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-[var(--radius-lg)] font-semibold transition ${
        compact ? "h-7 w-7 text-[var(--font-size-xs)]" : "h-8 min-w-8 px-2 text-[var(--font-size-sm)]"
      } ${
        active
          ? "bg-[var(--notion-selected)] text-[var(--color-dark-gray-2)]"
          : "text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)]"
      }`}
    >
      {label}
    </button>
  );
}

const CHECKERBOARD_STYLE: CSSProperties = {
  backgroundColor: "#fff",
  backgroundImage:
    "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
};

function ColorSwatchRow({
  presets,
  selected,
  onSelect,
  pickerValue,
  onPickerChange,
  pickerTitle,
}: {
  presets: string[];
  selected: string;
  onSelect: (color: string) => void;
  pickerValue: string;
  onPickerChange: (color: string) => void;
  pickerTitle: string;
}) {
  const customSelected =
    selected !== "" && !presets.includes(selected);

  return (
    <div className="grid w-full grid-cols-6 gap-1">
      {presets.map((color) => (
        <SwatchButton
          key={color}
          color={color}
          selected={selected === color}
          title={color === "transparent" ? "No fill" : color}
          onClick={() => onSelect(color)}
        />
      ))}
      <label
        title={pickerTitle}
        className={`relative flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-white ${
          customSelected
            ? "border-[#6965db] ring-2 ring-[#ece9ff]"
            : "border-[var(--color-light-gray-2)]"
        }`}
      >
        <span
          className="pointer-events-none text-[10px] font-medium text-[var(--color-mid-gray)]"
          aria-hidden
        >
          +
        </span>
        <input
          type="color"
          value={pickerValue.startsWith("#") ? pickerValue : "#1e293b"}
          onChange={(event) => onPickerChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

function PanelIconButton({
  active,
  title,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg transition ${
        active
          ? "bg-[#ece9ff] text-[var(--color-dark-gray-2)]"
          : "bg-white text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function StrokeWidthIcon({ width }: { width: number }) {
  return (
    <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden>
      <line
        x1="2"
        y1="6"
        x2="26"
        y2="6"
        stroke="currentColor"
        strokeWidth={width}
        strokeLinecap="round"
      />
    </svg>
  );
}

function StrokeStyleIcon({ style }: { style: CanvasStrokeStyle }) {
  const dash =
    style === "dashed" ? "5 4" : style === "dotted" ? "2 3" : undefined;
  return (
    <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden>
      <line
        x1="2"
        y1="6"
        x2="26"
        y2="6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={dash}
      />
    </svg>
  );
}

function SwatchButton({
  color,
  selected,
  title,
  onClick,
  size = "md",
}: {
  color: string;
  selected: boolean;
  title: string;
  onClick: () => void;
  size?: "md" | "sm";
}) {
  const dim = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const isTransparent = color === "transparent";
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`${dim} rounded-md border ${
        selected
          ? "border-[#6965db] ring-2 ring-[#ece9ff]"
          : "border-[var(--color-light-gray-2)]"
      }`}
      style={
        isTransparent
          ? CHECKERBOARD_STYLE
          : { backgroundColor: color }
      }
    />
  );
}

export function CanvasSelectionSubToolbar({
  blockId,
  layout = "horizontal",
  className = "",
  style,
}: CanvasSelectionSubToolbarProps) {
  const active = useActiveCanvas(blockId);
  const api = active?.api;
  useDocumentStore((s) => s.snapshot.blocks);
  const element = api?.getSelectedElement() ?? null;
  const isFloating = layout === "floating";
  const isVertical = layout === "vertical";

  const showText = element && isTextLikeElement(element);
  const showShape = element && isShapeElement(element);

  useEffect(() => {
    if (!showText) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      const key = event.key.toLowerCase();
      if (key !== "b" && key !== "i" && key !== "u") return;

      const activeApi = getActiveCanvas();
      const selected = activeApi?.getSelectedElement();
      if (!selected || !isTextLikeElement(selected)) return;

      event.preventDefault();
      if (key === "b") {
        activeApi?.patchSelected({ bold: !selected.bold });
      }
      if (key === "i") {
        activeApi?.patchSelected({ italic: !selected.italic });
      }
      if (key === "u") {
        activeApi?.patchSelected({ underline: !selected.underline });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showText]);

  if (isFloating) {
    if (!showText && !showShape) {
      return null;
    }

    return (
      <div
        className={`flex ${FLOATING_PANEL_WIDTH_CLASS} flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-2.5 py-3 shadow-[0_4px_24px_rgba(15,23,42,0.12)] ${className}`}
        style={style}
        data-editor="canvas-selection"
        onPointerDown={(event) => event.stopPropagation()}
      >
        {showText && element && api ? (
          <div className="flex w-full flex-col gap-2.5">
            <PanelLabel>Stroke</PanelLabel>
            <ColorSwatchRow
              presets={STROKE_COLOR_PRESETS}
              selected={element.strokeColor}
              onSelect={(color) => api.patchSelected({ strokeColor: color })}
              pickerValue={
                element.strokeColor.startsWith("#")
                  ? element.strokeColor
                  : "#1e293b"
              }
              onPickerChange={(color) =>
                api.patchSelected({ strokeColor: color })
              }
              pickerTitle="Custom text color"
            />

            <PanelLabel>Font family</PanelLabel>
            <div className="grid grid-cols-3 gap-1">
              {TEXT_FONT_FAMILIES.map((font) => {
                const active =
                  (element.fontFamily ?? CANVAS_HAND_FONT) === font.value;
                return (
                  <PanelIconButton
                    key={font.value}
                    active={active}
                    title={font.label}
                    onClick={() => api.patchSelected({ fontFamily: font.value })}
                  >
                    <span
                      className="text-[11px] font-semibold leading-none"
                      style={font.previewStyle}
                    >
                      Aa
                    </span>
                  </PanelIconButton>
                );
              })}
            </div>

            <PanelLabel>Font size</PanelLabel>
            <div className="grid grid-cols-4 gap-1">
              <PanelIconButton
                active={(element.fontSize ?? FONT_SIZE_M) === FONT_SIZE_S}
                title="Small (18px)"
                onClick={() => api.patchSelected({ fontSize: FONT_SIZE_S })}
              >
                <span className="text-[10px] font-semibold">S</span>
              </PanelIconButton>
              <PanelIconButton
                active={(element.fontSize ?? FONT_SIZE_M) === FONT_SIZE_M}
                title="Medium (24px)"
                onClick={() => api.patchSelected({ fontSize: FONT_SIZE_M })}
              >
                <span className="text-[11px] font-semibold">M</span>
              </PanelIconButton>
              <PanelIconButton
                active={(element.fontSize ?? FONT_SIZE_M) === FONT_SIZE_L}
                title="Large (30px)"
                onClick={() => api.patchSelected({ fontSize: FONT_SIZE_L })}
              >
                <span className="text-[12px] font-semibold">L</span>
              </PanelIconButton>
              <CanvasPanelSelect
                value={String(element.fontSize ?? FONT_SIZE_M)}
                onChange={(value) =>
                  api.patchSelected({ fontSize: Number(value) })
                }
                options={fontSizeDropdownOptions(element.fontSize ?? FONT_SIZE_M)}
                title="Font size"
                ariaLabel="Font size"
              />
            </div>

            <div className="grid grid-cols-3 gap-1">
              <PanelIconButton
                active={Boolean(element.bold)}
                title="Bold (Ctrl+B)"
                onClick={() => api.patchSelected({ bold: !element.bold })}
              >
                <span className="text-[12px] font-bold">B</span>
              </PanelIconButton>
              <PanelIconButton
                active={Boolean(element.italic)}
                title="Italic (Ctrl+I)"
                onClick={() => api.patchSelected({ italic: !element.italic })}
              >
                <span className="text-[12px] italic">I</span>
              </PanelIconButton>
              <PanelIconButton
                active={Boolean(element.underline)}
                title="Underline (Ctrl+U)"
                onClick={() =>
                  api.patchSelected({ underline: !element.underline })
                }
              >
                <span className="text-[12px] underline">U</span>
              </PanelIconButton>
            </div>

            <PanelLabel>Text align</PanelLabel>
            <div className="grid grid-cols-3 gap-1">
              <PanelIconButton
                active={(element.textAlign ?? "left") === "left"}
                title="Align left"
                onClick={() => api.patchSelected({ textAlign: "left" })}
              >
                <AlignLeft size={16} strokeWidth={2} />
              </PanelIconButton>
              <PanelIconButton
                active={(element.textAlign ?? "left") === "center"}
                title="Align center"
                onClick={() => api.patchSelected({ textAlign: "center" })}
              >
                <AlignCenter size={16} strokeWidth={2} />
              </PanelIconButton>
              <PanelIconButton
                active={(element.textAlign ?? "left") === "right"}
                title="Align right"
                onClick={() => api.patchSelected({ textAlign: "right" })}
              >
                <AlignRight size={16} strokeWidth={2} />
              </PanelIconButton>
            </div>
          </div>
        ) : null}

        {showShape && element && api ? (
          <div className="flex w-full flex-col gap-2.5">
            <PanelLabel>Stroke</PanelLabel>
            <ColorSwatchRow
              presets={STROKE_COLOR_PRESETS}
              selected={element.strokeColor}
              onSelect={(color) => api.patchSelected({ strokeColor: color })}
              pickerValue={
                element.strokeColor.startsWith("#")
                  ? element.strokeColor
                  : "#1e293b"
              }
              onPickerChange={(color) =>
                api.patchSelected({ strokeColor: color })
              }
              pickerTitle="Custom stroke color"
            />

            <PanelLabel>Stroke width</PanelLabel>
            <div className="grid grid-cols-3 gap-1">
              {STROKE_WIDTH_PRESETS.map((width) => (
                <PanelIconButton
                  key={width}
                  active={(element.strokeWidth ?? 2) === width}
                  title={`${width}px`}
                  onClick={() => api.patchSelected({ strokeWidth: width })}
                >
                  <StrokeWidthIcon width={width} />
                </PanelIconButton>
              ))}
            </div>

            <PanelLabel>Stroke style</PanelLabel>
            <div className="grid grid-cols-3 gap-1">
              {STROKE_STYLES.map((style) => (
                <PanelIconButton
                  key={style}
                  active={(element.strokeStyle ?? "solid") === style}
                  title={style}
                  onClick={() => api.patchSelected({ strokeStyle: style })}
                >
                  <StrokeStyleIcon style={style} />
                </PanelIconButton>
              ))}
            </div>

            <PanelLabel>Background</PanelLabel>
            <ColorSwatchRow
              presets={FILL_COLOR_PRESETS}
              selected={element.fillColor ?? "transparent"}
              onSelect={(color) => api.patchSelected({ fillColor: color })}
              pickerValue={
                element.fillColor === "transparent" ||
                !element.fillColor?.startsWith("#")
                  ? "#ffffff"
                  : element.fillColor
              }
              onPickerChange={(color) =>
                api.patchSelected({ fillColor: color })
              }
              pickerTitle="Custom fill color"
            />
          </div>
        ) : null}
      </div>
    );
  }

  if (isVertical) {
    return (
      <div
        className={`flex w-12 shrink-0 flex-col items-center border-r border-[var(--color-light-gray-2)] bg-[var(--color-white-2)] py-2 ${className}`}
        data-editor="canvas-selection"
        onPointerDown={(event) => event.stopPropagation()}
      >
        {!showText && !showShape ? (
          <span className="sr-only">Canvas selection options</span>
        ) : null}

        {showText && element && api ? (
          <div className="flex w-full flex-col items-center gap-2 px-0.5">
            <select
              value={element.fontSize ?? 20}
              title="Font size"
              aria-label="Font size"
              onChange={(event) =>
                api.patchSelected({ fontSize: Number(event.target.value) })
              }
              className="h-7 w-10 rounded-[var(--radius-lg)] border border-[var(--color-light-gray-2)] bg-white px-0.5 text-center text-[10px]"
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ToggleBtn
              active={Boolean(element.bold)}
              label="B"
              title="Bold (Ctrl+B)"
              compact
              onClick={() => api.patchSelected({ bold: !element.bold })}
            />
            <ToggleBtn
              active={Boolean(element.italic)}
              label="I"
              title="Italic (Ctrl+I)"
              compact
              onClick={() => api.patchSelected({ italic: !element.italic })}
            />
            <ToggleBtn
              active={Boolean(element.underline)}
              label="U"
              title="Underline (Ctrl+U)"
              compact
              onClick={() => api.patchSelected({ underline: !element.underline })}
            />
            <ToolbarDivider />
            <div className="flex flex-col items-center gap-1">
              {COLOR_SWATCHES.map((color) => (
                <SwatchButton
                  key={color}
                  color={color}
                  size="sm"
                  selected={element.strokeColor === color}
                  title={color}
                  onClick={() => api.patchSelected({ strokeColor: color })}
                />
              ))}
            </div>
            <input
              type="color"
              value={
                element.strokeColor.startsWith("#")
                  ? element.strokeColor
                  : "#1e293b"
              }
              onChange={(event) =>
                api.patchSelected({ strokeColor: event.target.value })
              }
              className="h-7 w-7 cursor-pointer rounded border border-[var(--color-light-gray-2)] bg-white p-0"
              title="Custom text color"
            />
            <button
              type="button"
              title="Edit text"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => api.beginTextEdit(element.id)}
              className="rounded-[var(--radius-lg)] px-1 py-0.5 text-[9px] leading-tight text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)]"
            >
              Edit
            </button>
          </div>
        ) : null}

        {showShape && element && api ? (
          <div className="flex w-full flex-col items-center gap-2 px-0.5">
            <select
              value={element.strokeStyle ?? "solid"}
              title="Border style"
              aria-label="Border style"
              onChange={(event) =>
                api.patchSelected({
                  strokeStyle: event.target.value as CanvasStrokeStyle,
                })
              }
              className="h-7 w-10 rounded-[var(--radius-lg)] border border-[var(--color-light-gray-2)] bg-white px-0.5 text-center text-[9px]"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dash</option>
              <option value="dotted">Dot</option>
            </select>
            <span className="text-[9px] text-[var(--color-mid-gray)]">Border</span>
            <div className="flex flex-col items-center gap-1">
              {COLOR_SWATCHES.map((color) => (
                <SwatchButton
                  key={`stroke-${color}`}
                  color={color}
                  size="sm"
                  selected={element.strokeColor === color}
                  title={color}
                  onClick={() => api.patchSelected({ strokeColor: color })}
                />
              ))}
            </div>
            <input
              type="color"
              value={
                element.strokeColor.startsWith("#")
                  ? element.strokeColor
                  : "#1e293b"
              }
              onChange={(event) =>
                api.patchSelected({ strokeColor: event.target.value })
              }
              className="h-7 w-7 cursor-pointer rounded border border-[var(--color-light-gray-2)] bg-white p-0"
              title="Border color"
            />
            <ToolbarDivider />
            <span className="text-[9px] text-[var(--color-mid-gray)]">Fill</span>
            <button
              type="button"
              title="No fill"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => api.patchSelected({ fillColor: "transparent" })}
              className="rounded-[var(--radius-lg)] border border-[var(--color-light-gray-2)] bg-white px-1 py-0.5 text-[9px]"
            >
              ∅
            </button>
            <div className="flex flex-col items-center gap-1">
              {COLOR_SWATCHES.map((color) => (
                <SwatchButton
                  key={`fill-${color}`}
                  color={color}
                  size="sm"
                  selected={element.fillColor === color}
                  title={color}
                  onClick={() => api.patchSelected({ fillColor: color })}
                />
              ))}
            </div>
            <input
              type="color"
              value={
                element.fillColor === "transparent" ||
                !element.fillColor.startsWith("#")
                  ? "#ffffff"
                  : element.fillColor
              }
              onChange={(event) =>
                api.patchSelected({ fillColor: event.target.value })
              }
              className="h-7 w-7 cursor-pointer rounded border border-[var(--color-light-gray-2)] bg-white p-0"
              title="Fill color"
            />
          </div>
        ) : null}
      </div>
    );
  }

  if (!showText && !showShape) {
    return null;
  }

  return (
    <div
      className="flex min-h-10 shrink-0 items-center justify-center gap-1 border-t border-[var(--color-light-gray-2)] bg-[var(--color-white-2)] px-3 py-1.5"
      data-editor="canvas-selection"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {showText && element && api ? (
        <div className="flex flex-wrap items-center justify-center gap-1">
          <label className="flex items-center gap-1.5 text-[var(--font-size-xs)] text-[var(--color-mid-gray)]">
            Size
            <select
              value={element.fontSize ?? 20}
              onChange={(event) =>
                api.patchSelected({ fontSize: Number(event.target.value) })
              }
              className="h-8 rounded-[var(--radius-lg)] border border-[var(--color-light-gray-2)] bg-white px-2 text-[var(--font-size-sm)]"
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <ToolbarDivider />
          <ToggleBtn
            active={Boolean(element.bold)}
            label="B"
            title="Bold (Ctrl+B)"
            onClick={() => api.patchSelected({ bold: !element.bold })}
          />
          <ToggleBtn
            active={Boolean(element.italic)}
            label="I"
            title="Italic (Ctrl+I)"
            onClick={() => api.patchSelected({ italic: !element.italic })}
          />
          <ToggleBtn
            active={Boolean(element.underline)}
            label="U"
            title="Underline (Ctrl+U)"
            onClick={() => api.patchSelected({ underline: !element.underline })}
          />
          <ToolbarDivider />
          <span className="text-[var(--font-size-xs)] text-[var(--color-mid-gray)]">
            Color
          </span>
          {COLOR_SWATCHES.map((color) => (
            <SwatchButton
              key={color}
              color={color}
              selected={element.strokeColor === color}
              title={color}
              onClick={() => api.patchSelected({ strokeColor: color })}
            />
          ))}
          <input
            type="color"
            value={
              element.strokeColor.startsWith("#") ? element.strokeColor : "#1e293b"
            }
            onChange={(event) =>
              api.patchSelected({ strokeColor: event.target.value })
            }
            className="h-8 w-8 cursor-pointer rounded border border-[var(--color-light-gray-2)] bg-white p-0.5"
            title="Custom text color"
          />
          <ToolbarDivider />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => api.beginTextEdit(element.id)}
            className="rounded-[var(--radius-lg)] px-2 py-1 text-[var(--font-size-xs)] text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)]"
          >
            Edit text
          </button>
        </div>
      ) : null}

      {showShape && element && api ? (
        <div className="flex flex-wrap items-center justify-center gap-1">
          <label className="flex items-center gap-1.5 text-[var(--font-size-xs)] text-[var(--color-mid-gray)]">
            Border
            <select
              value={element.strokeStyle ?? "solid"}
              onChange={(event) =>
                api.patchSelected({
                  strokeStyle: event.target.value as CanvasStrokeStyle,
                })
              }
              className="h-8 rounded-[var(--radius-lg)] border border-[var(--color-light-gray-2)] bg-white px-2 text-[var(--font-size-sm)]"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </label>
          <ToolbarDivider />
          <span className="text-[var(--font-size-xs)] text-[var(--color-mid-gray)]">
            Border
          </span>
          {COLOR_SWATCHES.map((color) => (
            <SwatchButton
              key={`stroke-${color}`}
              color={color}
              selected={element.strokeColor === color}
              title={color}
              onClick={() => api.patchSelected({ strokeColor: color })}
            />
          ))}
          <input
            type="color"
            value={
              element.strokeColor.startsWith("#") ? element.strokeColor : "#1e293b"
            }
            onChange={(event) =>
              api.patchSelected({ strokeColor: event.target.value })
            }
            className="h-8 w-8 cursor-pointer rounded border border-[var(--color-light-gray-2)] bg-white p-0.5"
            title="Border color"
          />
          <ToolbarDivider />
          <span className="text-[var(--font-size-xs)] text-[var(--color-mid-gray)]">
            Fill
          </span>
          <button
            type="button"
            title="No fill"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => api.patchSelected({ fillColor: "transparent" })}
            className="h-8 rounded-[var(--radius-lg)] border border-[var(--color-light-gray-2)] bg-white px-2 text-[var(--font-size-xs)]"
          >
            None
          </button>
          {COLOR_SWATCHES.map((color) => (
            <SwatchButton
              key={`fill-${color}`}
              color={color}
              selected={element.fillColor === color}
              title={color}
              onClick={() => api.patchSelected({ fillColor: color })}
            />
          ))}
          <input
            type="color"
            value={
              element.fillColor === "transparent" ||
              !element.fillColor.startsWith("#")
                ? "#ffffff"
                : element.fillColor
            }
            onChange={(event) =>
              api.patchSelected({ fillColor: event.target.value })
            }
            className="h-8 w-8 cursor-pointer rounded border border-[var(--color-light-gray-2)] bg-white p-0.5"
            title="Fill color"
          />
        </div>
      ) : null}
    </div>
  );
}

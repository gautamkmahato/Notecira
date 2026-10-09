"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { Block } from "@/lib/domain/types";
import { useDocumentStore } from "@/lib/document-store";
import { registerActiveCanvas } from "@/lib/canvas-block/active-canvas";
import { isTextLikeElement } from "@/lib/canvas-block/element-meta";
import {
  clampBoxToDocWidth,
  canvasContentSize,
  createCanvasElement,
  createImageElement,
  getCanvasElements,
  getCanvasMode,
  removeCanvasElement,
  toolToShapeType,
  updateCanvasElement,
} from "@/lib/canvas-block/model";
import {
  fitImageDisplaySize,
  loadImageFromSource,
  readFileAsDataUrl,
} from "@/lib/canvas-block/image-utils";
import { measureTextElementHeight } from "@/lib/canvas-block/measure-text";
import {
  clientToCanvasPoint,
  hitTestElement,
  marqueeSelectionBox,
  normalizeDragBox,
  pointerDistance,
  selectElementIdsInBox,
  unionElementBounds,
  POINTER_DRAG_THRESHOLD,
  type Point,
} from "@/lib/canvas-block/geometry";
import {
  applyLinearResize,
  createLinearElementPatch,
  elementRotationCenter,
  hitResizeHandleAtPoint,
  hitRotateHandleAtPoint,
  isLinearElement,
  moveElementPatch,
  resizeHandleCursor,
  resizeHandlePositions,
  svgRotationTransform,
  type ResizeHandle,
} from "@/lib/canvas-block/line-geometry";
import {
  groupSelectionOutline,
  marqueeOutline,
  renderCanvasElementSvg,
  selectionOutline,
} from "@/lib/canvas-block/render-element";
import type { CanvasElement, CanvasTool } from "@/lib/canvas-block/types";
import { findScrollParent } from "@/lib/canvas-block/find-scroll-parent";
import { CANVAS_HAND_FONT, CANVAS_MIN_SIZE } from "@/lib/canvas-block/types";

const DOC_WIDTH_GROW_THRESHOLD_RATIO = 0.22;
const DOC_WIDTH_GROW_CHUNK_RATIO = 0.85;
const DOC_WIDTH_GROW_LERP = 0.14;

type CanvasSurfaceProps = {
  block: Block;
  isActive?: boolean;
  editable?: boolean;
  onFocused: () => void;
};

type CreateDraft = {
  kind: "create";
  tool: CanvasTool;
  start: Point;
  current: Point;
  lockSquare: boolean;
};

type MoveDraft = {
  kind: "move";
  start: Point;
  current: Point;
  items: { id: string; origin: CanvasElement }[];
};

type MarqueeDraft = {
  kind: "marquee";
  start: Point;
  current: Point;
};

type ResizeDraft = {
  kind: "resize";
  id: string;
  handle: ResizeHandle;
  start: Point;
  current: Point;
  origin: CanvasElement;
};

type RotateDraft = {
  kind: "rotate";
  id: string;
  center: Point;
  startAngle: number;
  currentAngle: number;
  originRotation: number;
};

function applyResize(
  origin: CanvasElement,
  handle: ResizeHandle,
  current: Point,
  mode: "infinite" | "doc_width",
  canvasWidth: number,
): Partial<
  Pick<
    CanvasElement,
    | "x"
    | "y"
    | "width"
    | "height"
    | "startX"
    | "startY"
    | "endX"
    | "endY"
  >
> {
  if (isLinearElement(origin.type)) {
    const patch = applyLinearResize(origin, handle, current);
    if (mode === "doc_width") {
      const clamped = clampBoxToDocWidth(patch, canvasWidth);
      return { ...patch, ...clamped };
    }
    return patch;
  }

  const right = origin.x + origin.width;
  const bottom = origin.y + origin.height;
  let x = origin.x;
  let y = origin.y;
  let width = origin.width;
  let height = origin.height;

  if (handle.includes("e")) {
    width = Math.max(CANVAS_MIN_SIZE, current.x - origin.x);
  }
  if (handle.includes("w")) {
    width = Math.max(CANVAS_MIN_SIZE, right - current.x);
    x = current.x;
  }
  if (handle.includes("s")) {
    height = Math.max(CANVAS_MIN_SIZE, current.y - origin.y);
  }
  if (handle.includes("n")) {
    height = Math.max(CANVAS_MIN_SIZE, bottom - current.y);
    y = current.y;
  }

  if (origin.type === "square") {
    const size = Math.max(width, height);
    width = size;
    height = size;
    if (handle.includes("w")) x = right - size;
    if (handle.includes("n")) y = bottom - size;
  }

  const box =
    mode === "doc_width"
      ? clampBoxToDocWidth({ x, y, width, height }, canvasWidth)
      : { x: Math.max(0, x), y: Math.max(0, y), width, height };

  return box;
}

export function CanvasSurface({
  block,
  isActive = false,
  editable = true,
  onFocused,
}: CanvasSurfaceProps) {
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const shiftHeldRef = useRef(false);
  const textDraftRef = useRef<{ id: string; text: string } | null>(null);
  const moveDraftRef = useRef<MoveDraft | null>(null);
  const pointerCanvasRef = useRef<Point | null>(null);
  const editingTextIdRef = useRef<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [tool, setTool] = useState<CanvasTool>("select");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const [draft, setDraft] = useState<CreateDraft | null>(null);
  const [moveDraft, setMoveDraft] = useState<MoveDraft | null>(null);
  const [marqueeDraft, setMarqueeDraft] = useState<MarqueeDraft | null>(null);
  const [resizeDraft, setResizeDraft] = useState<ResizeDraft | null>(null);
  const [rotateDraft, setRotateDraft] = useState<RotateDraft | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(720);
  const [docModeMinHeightPx, setDocModeMinHeightPx] = useState(720);
  const docMinHeightRef = useRef(docModeMinHeightPx);
  const docGrowTargetRef = useRef(docModeMinHeightPx);
  const growRafRef = useRef<number | null>(null);

  docMinHeightRef.current = docModeMinHeightPx;

  editingTextIdRef.current = editingTextId;

  const mode = getCanvasMode(block.attrs);
  const elements = useMemo(
    () => getCanvasElements(block),
    [block.attrs.canvasElements, block.id],
  );

  const persistElements = useCallback(
    (next: CanvasElement[]) => {
      updateBlockAttrs(block.id, { canvasElements: next });
    },
    [block.id, updateBlockAttrs],
  );

  const { width: canvasWidth, height: canvasHeight } = useMemo(
    () =>
      canvasContentSize(
        elements,
        mode,
        containerWidth,
        mode === "doc_width" ? docModeMinHeightPx : undefined,
      ),
    [containerWidth, docModeMinHeightPx, elements, mode],
  );

  useEffect(() => {
    const baseline = () => Math.max(360, window.innerHeight * 2);
    const applyBaseline = () => {
      const base = baseline();
      setDocModeMinHeightPx((current) => {
        const next = Math.max(current, base);
        docGrowTargetRef.current = Math.max(docGrowTargetRef.current, next);
        return next;
      });
    };
    applyBaseline();
    window.addEventListener("resize", applyBaseline);
    return () => window.removeEventListener("resize", applyBaseline);
  }, []);

  useEffect(() => {
    if (mode !== "doc_width") return;

    const canvasNode = containerRef.current;
    if (!canvasNode) return;

    const scrollEl = findScrollParent(canvasNode);
    if (!scrollEl) return;

    const growThresholdPx = () =>
      Math.max(200, window.innerHeight * DOC_WIDTH_GROW_THRESHOLD_RATIO);
    const growChunkPx = () =>
      Math.max(320, window.innerHeight * DOC_WIDTH_GROW_CHUNK_RATIO);

    const stopGrowAnimation = () => {
      if (growRafRef.current !== null) {
        cancelAnimationFrame(growRafRef.current);
        growRafRef.current = null;
      }
    };

    const tickGrow = () => {
      const target = docGrowTargetRef.current;
      const current = docMinHeightRef.current;
      const diff = target - current;

      if (Math.abs(diff) < 1.5) {
        setDocModeMinHeightPx(target);
        stopGrowAnimation();
        return;
      }

      const next = current + diff * DOC_WIDTH_GROW_LERP;
      setDocModeMinHeightPx(next);
      growRafRef.current = requestAnimationFrame(tickGrow);
    };

    const startGrowAnimation = () => {
      if (growRafRef.current === null) {
        growRafRef.current = requestAnimationFrame(tickGrow);
      }
    };

    const requestGrow = () => {
      const nextTarget = Math.max(
        docGrowTargetRef.current,
        docMinHeightRef.current + growChunkPx(),
      );
      if (nextTarget <= docGrowTargetRef.current + 1) return;
      docGrowTargetRef.current = nextTarget;
      startGrowAnimation();
    };

    const onScroll = () => {
      const distanceFromBottom =
        scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
      if (distanceFromBottom <= growThresholdPx()) {
        requestGrow();
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) return;
      const distanceFromBottom =
        scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
      if (distanceFromBottom <= growThresholdPx() * 1.5) {
        requestGrow();
      }
    };

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    scrollEl.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      scrollEl.removeEventListener("wheel", onWheel);
      stopGrowAnimation();
    };
  }, [mode]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(Math.max(1, entry.contentRect.width));
      }
    });

    observer.observe(node);
    setContainerWidth(Math.max(1, node.clientWidth));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      shiftHeldRef.current = event.shiftKey;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  useEffect(() => {
    moveDraftRef.current = moveDraft;
  }, [moveDraft]);

  const commitTextEdit = useCallback(() => {
    const draft = textDraftRef.current;
    if (!draft) return;
    const currentBlock = useDocumentStore.getState().getBlock(block.id);
    if (!currentBlock) return;
    const latest = getCanvasElements(currentBlock);
    const target = latest.find((element) => element.id === draft.id);
    if (!target) return;
    const height = measureTextElementHeight(target, draft.text, target.width);
    persistElements(
      updateCanvasElement(latest, draft.id, {
        text: draft.text,
        height,
      }),
    );
    textDraftRef.current = null;
  }, [block.id, persistElements]);

  const deleteSelected = useCallback(() => {
    if (editingTextId) {
      commitTextEdit();
      setEditingTextId(null);
    }
    if (selectedIds.length === 0) return;
    const currentBlock = useDocumentStore.getState().getBlock(block.id);
    if (!currentBlock) return;
    let latest = getCanvasElements(currentBlock);
    for (const id of selectedIds) {
      latest = removeCanvasElement(latest, id);
    }
    persistElements(latest);
    setSelectedIds([]);
  }, [block.id, commitTextEdit, editingTextId, persistElements, selectedIds]);

  const getSelectedElement = useCallback((): CanvasElement | null => {
    if (!selectedId) return null;
    const currentBlock = useDocumentStore.getState().getBlock(block.id);
    if (!currentBlock) return null;
    return (
      getCanvasElements(currentBlock).find(
        (element) => element.id === selectedId,
      ) ?? null
    );
  }, [block.id, selectedId]);

  const handleTextDraftChange = useCallback((id: string, text: string) => {
    textDraftRef.current = { id, text };
  }, []);

  const handleTextCommit = useCallback(
    (elementId: string, text: string, heightPx?: number) => {
      const currentBlock = useDocumentStore.getState().getBlock(block.id);
      if (!currentBlock) return;
      const latest = getCanvasElements(currentBlock);
      const target = latest.find((element) => element.id === elementId);
      if (!target) return;
      const height =
        heightPx ?? measureTextElementHeight(target, text, target.width);
      persistElements(
        updateCanvasElement(latest, elementId, { text, height }),
      );
      textDraftRef.current = null;
    },
    [block.id, persistElements],
  );

  const patchSelected = useCallback(
    (patch: Partial<CanvasElement>) => {
      if (!selectedId) return;
      const currentBlock = useDocumentStore.getState().getBlock(block.id);
      if (!currentBlock) return;
      const latest = getCanvasElements(currentBlock);
      persistElements(updateCanvasElement(latest, selectedId, patch));
    },
    [block.id, persistElements, selectedId],
  );

  const updatePointerFromClient = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    pointerCanvasRef.current = clientToCanvasPoint(svg, clientX, clientY);
  }, []);

  const resolvePastePoint = useCallback((): Point => {
    if (pointerCanvasRef.current) {
      return pointerCanvasRef.current;
    }

    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) {
      return { x: 48, y: 48 };
    }

    const rect = container.getBoundingClientRect();
    return clientToCanvasPoint(
      svg,
      rect.left + rect.width / 2,
      rect.top + Math.min(rect.height * 0.35, 160),
    );
  }, []);

  const resolveViewportCenterPoint = useCallback((): Point => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) {
      return { x: canvasWidth / 2, y: canvasHeight / 2 };
    }

    const rect = container.getBoundingClientRect();
    return clientToCanvasPoint(
      svg,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
  }, [canvasHeight, canvasWidth]);

  const addImageElement = useCallback(
    async (
      src: string,
      naturalWidth: number,
      naturalHeight: number,
      anchor: Point,
      placement: "center" | "top-left",
    ) => {
      const { width, height } = fitImageDisplaySize(
        naturalWidth,
        naturalHeight,
      );
      let box =
        placement === "center"
          ? {
              x: Math.max(0, anchor.x - width / 2),
              y: Math.max(0, anchor.y - height / 2),
              width,
              height,
            }
          : {
              x: Math.max(0, anchor.x),
              y: Math.max(0, anchor.y),
              width,
              height,
            };
      if (mode === "doc_width") {
        box = clampBoxToDocWidth(box, canvasWidth);
        box.y = Math.max(0, box.y);
      }

      const element = createImageElement(box, src);
      const currentBlock = useDocumentStore.getState().getBlock(block.id);
      const latest = currentBlock ? getCanvasElements(currentBlock) : elements;
      persistElements([...latest, element]);
      setSelectedIds([element.id]);
      setTool("select");
      setEditingTextId(null);
    },
    [block.id, canvasWidth, elements, mode, persistElements],
  );

  const placeImageFromFile = useCallback(
    async (file: File, atViewportCenter: boolean) => {
      if (!file.type.startsWith("image/")) return;
      const dataUrl = await readFileAsDataUrl(file);
      const loaded = await loadImageFromSource(dataUrl);
      const anchor = atViewportCenter
        ? resolveViewportCenterPoint()
        : resolvePastePoint();
      await addImageElement(
        loaded.src,
        loaded.naturalWidth,
        loaded.naturalHeight,
        anchor,
        atViewportCenter ? "center" : "top-left",
      );
    },
    [
      addImageElement,
      resolvePastePoint,
      resolveViewportCenterPoint,
    ],
  );

  const placePastedImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const dataUrl = await readFileAsDataUrl(file);
      const loaded = await loadImageFromSource(dataUrl);
      await addImageElement(
        loaded.src,
        loaded.naturalWidth,
        loaded.naturalHeight,
        resolvePastePoint(),
        "top-left",
      );
    },
    [addImageElement, resolvePastePoint],
  );

  const openImagePicker = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const placePastedText = useCallback(
    (rawText: string) => {
      const text = rawText.replace(/\r\n/g, "\n").trimEnd();
      if (!text.trim()) return;

      const point = resolvePastePoint();
      const width = 220;
      const draft = createCanvasElement("text", {
        x: point.x,
        y: point.y,
        width,
        height: 40,
      });
      const sized = measureTextElementHeight(
        { ...draft, text },
        text,
        width,
      );
      let box = {
        x: Math.max(0, point.x),
        y: Math.max(0, point.y),
        width,
        height: sized,
      };
      if (mode === "doc_width") {
        box = clampBoxToDocWidth(box, canvasWidth);
      }

      const element: CanvasElement = {
        ...draft,
        ...box,
        text,
      };

      const currentBlock = useDocumentStore.getState().getBlock(block.id);
      const latest = currentBlock ? getCanvasElements(currentBlock) : elements;
      persistElements([...latest, element]);
      setSelectedIds([element.id]);
      setTool("select");
      setEditingTextId(null);
    },
    [block.id, canvasWidth, elements, mode, persistElements, resolvePastePoint],
  );

  const beginEditing = useCallback(
    (id: string) => {
      const currentBlock = useDocumentStore.getState().getBlock(block.id);
      const source = currentBlock ? getCanvasElements(currentBlock) : elements;
      const target = source.find((element) => element.id === id);
      if (!target || !isTextLikeElement(target)) return;
      textDraftRef.current = { id, text: target.text ?? "" };
      setSelectedIds([id]);
      setEditingTextId(id);
      setTool("select");
    },
    [block.id, elements],
  );

  const commitMoveDraft = useCallback(
    (draft: MoveDraft) => {
      const dx = draft.current.x - draft.start.x;
      const dy = draft.current.y - draft.start.y;
      const currentBlock = useDocumentStore.getState().getBlock(block.id);
      if (!currentBlock) return;
      let latest = getCanvasElements(currentBlock);

      for (const item of draft.items) {
        let nextX = item.origin.x + dx;
        let nextY = item.origin.y + dy;

        if (mode === "doc_width") {
          nextX = Math.max(
            0,
            Math.min(nextX, canvasWidth - item.origin.width),
          );
        }

        latest = updateCanvasElement(
          latest,
          item.id,
          moveElementPatch(
            item.origin,
            nextX - item.origin.x,
            Math.max(0, nextY) - item.origin.y,
          ),
        );
      }

      persistElements(latest);
      setSelectedIds(draft.items.map((item) => item.id));
    },
    [block.id, canvasWidth, mode, persistElements],
  );

  const finishActiveMove = useCallback(() => {
    const draft = moveDraftRef.current;
    moveDraftRef.current = null;
    setMoveDraft(null);
    if (!draft) return;
    commitMoveDraft(draft);
  }, [commitMoveDraft]);

  useEffect(() => {
    if (!editable || !isActive) {
      return;
    }

    registerActiveCanvas({
      blockId: block.id,
      tool,
      setTool,
      deleteSelected,
      selectedId,
      selectedIds,
      getSelectedElement,
      patchSelected,
      beginTextEdit: (elementId) => {
        const targetId = elementId ?? selectedId;
        if (targetId) beginEditing(targetId);
      },
      openImagePicker,
    });

    return () => registerActiveCanvas(null);
  }, [
    beginEditing,
    block.id,
    deleteSelected,
    editable,
    getSelectedElement,
    isActive,
    openImagePicker,
    patchSelected,
    selectedId,
    selectedIds,
    tool,
  ]);

  useEffect(() => {
    if (!editable || !isActive) return;

    const onPaste = (event: ClipboardEvent) => {
      if (editingTextIdRef.current) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "TEXTAREA" ||
          target.tagName === "INPUT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const clipboard = event.clipboardData;
      if (!clipboard) return;

      const imageItem = Array.from(clipboard.items ?? []).find((item) =>
        item.type.startsWith("image/"),
      );
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          event.preventDefault();
          void placePastedImage(file);
          return;
        }
      }

      const fileFromList = clipboard.files?.[0];
      if (fileFromList?.type.startsWith("image/")) {
        event.preventDefault();
        void placePastedImage(fileFromList);
        return;
      }

      const text = clipboard.getData("text/plain");
      if (!text?.trim()) return;

      event.preventDefault();
      placePastedText(text);
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [editable, isActive, placePastedImage, placePastedText]);

  useEffect(() => {
    if (!editable || !isActive) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (editingTextId) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "9" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        openImagePicker();
        return;
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "a"
      ) {
        event.preventDefault();
        const currentBlock = useDocumentStore.getState().getBlock(block.id);
        const latest = currentBlock ? getCanvasElements(currentBlock) : elements;
        setSelectedIds(latest.map((element) => element.id));
        return;
      }

      if (event.key === "Enter" && selectedId) {
        const currentBlock = useDocumentStore.getState().getBlock(block.id);
        const latest = currentBlock ? getCanvasElements(currentBlock) : elements;
        const hit = latest.find((element) => element.id === selectedId);
        if (hit && isTextLikeElement(hit)) {
          event.preventDefault();
          beginEditing(selectedId);
          return;
        }
      }

      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (selectedIds.length === 0) return;
      event.preventDefault();
      deleteSelected();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    beginEditing,
    block.id,
    deleteSelected,
    editable,
    editingTextId,
    elements,
    openImagePicker,
    isActive,
    selectedId,
    selectedIds,
  ]);

  const displayElements = useMemo(() => {
    const interactiveDraft = moveDraft ?? resizeDraft ?? rotateDraft;
    if (!interactiveDraft) return elements;

    return elements.map((element) => {
      if (interactiveDraft.kind === "move") {
        const item = interactiveDraft.items.find(
          (entry) => entry.id === element.id,
        );
        if (!item) return element;

        const dx = interactiveDraft.current.x - interactiveDraft.start.x;
        const dy = interactiveDraft.current.y - interactiveDraft.start.y;
        let nextX = item.origin.x + dx;
        let nextY = item.origin.y + dy;

        if (mode === "doc_width") {
          nextX = Math.max(
            0,
            Math.min(nextX, canvasWidth - item.origin.width),
          );
        }

        return {
          ...element,
          ...moveElementPatch(
            item.origin,
            nextX - item.origin.x,
            Math.max(0, nextY) - item.origin.y,
          ),
        };
      }

      if (interactiveDraft.id !== element.id) return element;

      if (interactiveDraft.kind === "rotate") {
        const delta =
          (interactiveDraft.currentAngle - interactiveDraft.startAngle) *
          (180 / Math.PI);
        return {
          ...element,
          rotation: interactiveDraft.originRotation + delta,
        };
      }

      const patch = applyResize(
        interactiveDraft.origin,
        interactiveDraft.handle,
        interactiveDraft.current,
        mode,
        canvasWidth,
      );
      return { ...element, ...patch };
    });
  }, [canvasWidth, elements, mode, moveDraft, resizeDraft, rotateDraft]);

  const selected =
    displayElements.find((element) => element.id === selectedId) ?? null;

  const selectedElements = useMemo(
    () => displayElements.filter((element) => selectedIds.includes(element.id)),
    [displayElements, selectedIds],
  );

  const groupSelectionBounds = useMemo(
    () => unionElementBounds(selectedElements),
    [selectedElements],
  );

  const finishCreate = useCallback(
    (
      box: { x: number; y: number; width: number; height: number },
      shapeTool: CanvasTool,
      lockSquare: boolean,
    ) => {
      const type = toolToShapeType(shapeTool, lockSquare);
      if (!type) return;

      const normalized =
        mode === "doc_width" ? clampBoxToDocWidth(box, canvasWidth) : box;

      const element = createCanvasElement(type, normalized);
      persistElements([...elements, element]);
      if (isTextLikeElement(element)) {
        setSelectedIds([element.id]);
        beginEditing(element.id);
      } else {
        setSelectedIds([element.id]);
        setTool("select");
      }
    },
    [beginEditing, canvasWidth, elements, mode, persistElements],
  );

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!editable) return;
    onFocused();
    containerRef.current?.focus();

    const svg = svgRef.current;
    if (!svg) return;

    const point = clientToCanvasPoint(svg, event.clientX, event.clientY);
    pointerCanvasRef.current = point;

    if (editingTextId) {
      const hit = hitTestElement(displayElements, point);
      if (!hit || hit.id !== editingTextId) {
        commitTextEdit();
        setEditingTextId(null);
      } else {
        return;
      }
    }

    const lockSquare = event.shiftKey || shiftHeldRef.current;

    if (tool === "eraser") {
      const hit = hitTestElement(displayElements, point);
      if (hit) {
        const currentBlock = useDocumentStore.getState().getBlock(block.id);
        const latest = currentBlock ? getCanvasElements(currentBlock) : elements;
        persistElements(removeCanvasElement(latest, hit.id));
        setSelectedIds((ids) => ids.filter((id) => id !== hit.id));
        if (editingTextId === hit.id) {
          setEditingTextId(null);
        }
      }
      return;
    }

    if (tool === "select") {
      if (selectedIds.length === 1 && selected && editingTextId !== selected.id) {
        if (hitRotateHandleAtPoint(selected, point)) {
          const center = elementRotationCenter(selected);
          const startAngle = Math.atan2(
            point.y - center.y,
            point.x - center.x,
          );
          setRotateDraft({
            kind: "rotate",
            id: selected.id,
            center,
            startAngle,
            currentAngle: startAngle,
            originRotation: selected.rotation ?? 0,
          });
          event.currentTarget.setPointerCapture(event.pointerId);
          return;
        }

        const handle = hitResizeHandleAtPoint(selected, point);
        if (handle) {
          const origin = elements.find((e) => e.id === selected.id)!;
          setResizeDraft({
            kind: "resize",
            id: selected.id,
            handle,
            start: point,
            current: point,
            origin,
          });
          event.currentTarget.setPointerCapture(event.pointerId);
          return;
        }
      }

      const hit = hitTestElement(displayElements, point);

      if (!hit) {
        setMarqueeDraft({
          kind: "marquee",
          start: point,
          current: point,
        });
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }

      const moveIds =
        selectedIds.includes(hit.id) && selectedIds.length > 1
          ? selectedIds
          : [hit.id];
      setSelectedIds(moveIds);

      if (isTextLikeElement(hit)) {
        return;
      }

      const items = moveIds
        .map((id) => {
          const origin = elements.find((element) => element.id === id);
          return origin ? { id, origin } : null;
        })
        .filter(
          (item): item is { id: string; origin: CanvasElement } => item !== null,
        )
        .filter((item) => !isTextLikeElement(item.origin));

      if (items.length > 0) {
        setMoveDraft({
          kind: "move",
          start: point,
          current: point,
          items,
        });
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      return;
    }

    if (
      tool === "text" ||
      tool === "sticky" ||
      tool === "rectangle" ||
      tool === "decision" ||
      tool === "circle" ||
      tool === "arrow" ||
      tool === "line"
    ) {
      setDraft({
        kind: "create",
        tool,
        start: point,
        current: point,
        lockSquare,
      });
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    const point = clientToCanvasPoint(svg, event.clientX, event.clientY);
    pointerCanvasRef.current = point;

    if (draft) {
      setDraft({
        ...draft,
        current: point,
        lockSquare: draft.lockSquare || event.shiftKey,
      });
      return;
    }

    if (marqueeDraft) {
      setMarqueeDraft({ ...marqueeDraft, current: point });
      return;
    }

    if (moveDraft) {
      setMoveDraft({ ...moveDraft, current: point });
      return;
    }

    if (resizeDraft) {
      setResizeDraft({ ...resizeDraft, current: point });
      return;
    }

    if (rotateDraft) {
      setRotateDraft({
        ...rotateDraft,
        currentAngle: Math.atan2(
          point.y - rotateDraft.center.y,
          point.x - rotateDraft.center.x,
        ),
      });
    }
  };

  const commitMove = useCallback(
    (state: MoveDraft) => {
      commitMoveDraft(state);
    },
    [commitMoveDraft],
  );

  const commitResize = (state: ResizeDraft) => {
    const patch = applyResize(
      state.origin,
      state.handle,
      state.current,
      mode,
      canvasWidth,
    );
    const currentBlock = useDocumentStore.getState().getBlock(block.id);
    if (!currentBlock) return;
    const latest = getCanvasElements(currentBlock);
    persistElements(updateCanvasElement(latest, state.id, patch));
    setSelectedIds([state.id]);
  };

  const commitRotate = (state: RotateDraft) => {
    const delta =
      (state.currentAngle - state.startAngle) * (180 / Math.PI);
    const currentBlock = useDocumentStore.getState().getBlock(block.id);
    if (!currentBlock) return;
    const latest = getCanvasElements(currentBlock);
    persistElements(
      updateCanvasElement(latest, state.id, {
        rotation: state.originRotation + delta,
      }),
    );
    setSelectedIds([state.id]);
  };

  const onPointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;

    if (draft && svg) {
      const point = clientToCanvasPoint(svg, event.clientX, event.clientY);
      if (draft.tool === "line" || draft.tool === "arrow") {
        const patch = createLinearElementPatch(draft.tool, draft.start, point);
        const normalized =
          mode === "doc_width"
            ? { ...patch, ...clampBoxToDocWidth(patch, canvasWidth) }
            : patch;
        const element = createCanvasElement(draft.tool, normalized, {
          startX: patch.startX,
          startY: patch.startY,
          endX: patch.endX,
          endY: patch.endY,
        });
        persistElements([...elements, element]);
        setSelectedIds([element.id]);
        setTool("select");
      } else {
        const box = normalizeDragBox(
          draft.start,
          point,
          draft.lockSquare ||
            ((draft.tool === "rectangle" || draft.tool === "sticky") &&
              event.shiftKey),
        );
        finishCreate(box, draft.tool, draft.lockSquare);
      }
      setDraft(null);
    }

    if (marqueeDraft && svg) {
      const point = clientToCanvasPoint(svg, event.clientX, event.clientY);
      const distance = pointerDistance(marqueeDraft.start, point);
      if (distance > POINTER_DRAG_THRESHOLD) {
        const box = marqueeSelectionBox(marqueeDraft.start, point);
        const currentBlock = useDocumentStore.getState().getBlock(block.id);
        const latest = currentBlock ? getCanvasElements(currentBlock) : elements;
        setSelectedIds(selectElementIdsInBox(latest, box));
      } else {
        setSelectedIds([]);
      }
      setMarqueeDraft(null);
    }

    if (moveDraft) {
      commitMove(moveDraft);
      setMoveDraft(null);
    }

    if (resizeDraft) {
      commitResize(resizeDraft);
      setResizeDraft(null);
    }

    if (rotateDraft) {
      commitRotate(rotateDraft);
      setRotateDraft(null);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const previewType = draft ? toolToShapeType(draft.tool, draft.lockSquare) : null;
  const previewElement: CanvasElement | null = useMemo(() => {
    if (!draft || !previewType) return null;
    if (draft.tool === "line" || draft.tool === "arrow") {
      const patch = createLinearElementPatch(
        draft.tool,
        draft.start,
        draft.current,
      );
      return createCanvasElement(draft.tool, patch, {
        startX: patch.startX,
        startY: patch.startY,
        endX: patch.endX,
        endY: patch.endY,
      });
    }
    const box = normalizeDragBox(draft.start, draft.current, draft.lockSquare);
    return createCanvasElement(previewType, box);
  }, [draft, previewType]);

  const containerClass =
    mode === "infinite"
      ? "relative w-full overflow-auto border-y border-[var(--color-light-gray-2)] bg-[var(--color-white-2)]"
      : "relative w-full overflow-x-hidden overflow-y-visible bg-[var(--color-white)]";

  const containerStyle =
    mode === "infinite" ? { maxHeight: "min(70vh, 560px)" } : undefined;

  const editingElement = editingTextId
    ? displayElements.find((e) => e.id === editingTextId)
    : null;

  const cursorForTool =
    tool === "eraser"
      ? "cell"
      : tool === "select"
        ? moveDraft || resizeDraft || rotateDraft
          ? "grabbing"
          : marqueeDraft
            ? "crosshair"
            : "default"
        : "crosshair";

  return (
    <div
      ref={containerRef}
      className={containerClass}
      style={containerStyle}
      tabIndex={editable && isActive ? 0 : undefined}
      onPointerDown={() => onFocused()}
      onPointerMove={(event) => {
        updatePointerFromClient(event.clientX, event.clientY);
      }}
    >
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            void placeImageFromFile(file, true);
          }
        }}
      />
      <div
        className="relative"
        style={{
          width: mode === "infinite" ? canvasWidth : "100%",
          height: canvasHeight,
          minWidth: mode === "infinite" ? canvasWidth : "100%",
          maxWidth: mode === "doc_width" ? "100%" : undefined,
        }}
      >
        <svg
          ref={svgRef}
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="block touch-none select-none"
          style={{
            width: mode === "infinite" ? canvasWidth : "100%",
            maxWidth: mode === "doc_width" ? "100%" : undefined,
            height: canvasHeight,
            cursor: cursorForTool,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {mode === "doc_width" ? (
            <rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill="var(--color-white)"
            />
          ) : null}

          {displayElements.map((element) => (
            <g key={element.id} transform={svgRotationTransform(element)}>
              {renderCanvasElementSvg(element, {
                hideText:
                  editingTextId === element.id && isTextLikeElement(element),
              })}
            </g>
          ))}

          {previewElement ? (
            <g opacity={0.55} transform={svgRotationTransform(previewElement)}>
              {renderCanvasElementSvg(previewElement, {
                draftPreview:
                  draft?.tool !== "line" && draft?.tool !== "arrow",
              })}
            </g>
          ) : null}

          {marqueeDraft ? (
            marqueeOutline(
              marqueeSelectionBox(marqueeDraft.start, marqueeDraft.current),
            )
          ) : null}

          {tool === "select" && !editingTextId && selectedIds.length > 0 ? (
            <>
              {selectedIds.length > 1 && groupSelectionBounds
                ? groupSelectionOutline(groupSelectionBounds)
                : null}
              {selectedElements.map((element) => (
                <g
                  key={`selection-${element.id}`}
                  transform={svgRotationTransform(element)}
                >
                  {selectionOutline(element, {
                    grouped: selectedIds.length > 1,
                  })}
                </g>
              ))}
              {selectedIds.length === 1 && selected ? (
                <g transform={svgRotationTransform(selected)}>
                  {resizeHandles(selected)}
                  {rotateHandle(selected)}
                </g>
              ) : null}
            </>
          ) : null}
        </svg>

        {editable && tool === "select"
          ? displayElements
              .filter((element) => isTextLikeElement(element))
              .map((element) => (
                <TextHitTarget
                  key={`hit-${element.id}`}
                  element={element}
                  hidden={editingTextId === element.id}
                  svgRef={svgRef}
                  onSelect={() => {
                    onFocused();
                    setSelectedIds([element.id]);
                  }}
                  onEdit={() => beginEditing(element.id)}
                  onMoveStart={(point) => {
                    const moveIds =
                      selectedIds.includes(element.id) && selectedIds.length > 1
                        ? selectedIds
                        : [element.id];
                    setSelectedIds(moveIds);
                    const items = moveIds
                      .map((id) => {
                        const origin = elements.find((entry) => entry.id === id);
                        return origin ? { id, origin } : null;
                      })
                      .filter(
                        (
                          item,
                        ): item is { id: string; origin: CanvasElement } =>
                          item !== null,
                      );
                    if (items.length === 0) return;
                    setMoveDraft({
                      kind: "move",
                      start: point,
                      current: point,
                      items,
                    });
                  }}
                  onMove={(point) => {
                    setMoveDraft((draft) =>
                      draft ? { ...draft, current: point } : draft,
                    );
                  }}
                  onMoveEnd={finishActiveMove}
                />
              ))
          : null}

        {editingElement && editable && isTextLikeElement(editingElement) ? (
          <TextEditorOverlay
            key={editingElement.id}
            element={editingElement}
            onDraftChange={handleTextDraftChange}
            onCommit={(text, heightPx) =>
              handleTextCommit(editingElement.id, text, heightPx)
            }
            onClose={() => setEditingTextId(null)}
          />
        ) : null}
      </div>
    </div>
  );
}

function resizeHandles(element: CanvasElement) {
  const size = 8;
  const half = size / 2;

  return resizeHandlePositions(element).map((entry) => (
    <rect
      key={entry.handle}
      x={entry.x - half}
      y={entry.y - half}
      width={size}
      height={size}
      fill="#fff"
      stroke="#6965db"
      strokeWidth={1.5}
      style={{ cursor: resizeHandleCursor(entry.handle) }}
    />
  ));
}

function rotateHandle(element: CanvasElement) {
  const center = elementRotationCenter(element);
  const localHandle = {
    x: center.x,
    y: element.y - 28,
  };

  return (
    <g>
      <line
        x1={center.x}
        y1={center.y}
        x2={localHandle.x}
        y2={localHandle.y}
        stroke="#6965db"
        strokeWidth={1.5}
        pointerEvents="none"
      />
      <circle
        cx={localHandle.x}
        cy={localHandle.y}
        r={6}
        fill="#fff"
        stroke="#6965db"
        strokeWidth={1.5}
        style={{ cursor: "grab" }}
      />
    </g>
  );
}

function elementOverlayStyle(element: CanvasElement): CSSProperties {
  const rotation = element.rotation ?? 0;
  const style: CSSProperties = {
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
  };
  if (rotation) {
    style.transform = `rotate(${rotation}deg)`;
    style.transformOrigin = `${element.width / 2}px ${element.height / 2}px`;
  }
  return style;
}

function TextHitTarget({
  element,
  hidden,
  svgRef,
  onSelect,
  onEdit,
  onMoveStart,
  onMove,
  onMoveEnd,
}: {
  element: CanvasElement;
  hidden: boolean;
  svgRef: RefObject<SVGSVGElement | null>;
  onSelect: () => void;
  onEdit: () => void;
  onMoveStart: (point: Point) => void;
  onMove: (point: Point) => void;
  onMoveEnd: () => void;
}) {
  const startRef = useRef<Point | null>(null);
  const draggingRef = useRef(false);

  if (hidden) return null;

  return (
    <div
      className="absolute z-10 cursor-default"
      style={elementOverlayStyle(element)}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onEdit();
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect();
        const svg = svgRef.current;
        if (!svg) return;
        startRef.current = clientToCanvasPoint(
          svg,
          event.clientX,
          event.clientY,
        );
        draggingRef.current = false;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const svg = svgRef.current;
        const start = startRef.current;
        if (!svg || !start) return;
        const point = clientToCanvasPoint(svg, event.clientX, event.clientY);
        if (
          !draggingRef.current &&
          pointerDistance(start, point) > POINTER_DRAG_THRESHOLD
        ) {
          draggingRef.current = true;
          onMoveStart(start);
        }
        if (draggingRef.current) {
          onMove(point);
        }
      }}
      onPointerUp={(event) => {
        if (draggingRef.current) {
          onMoveEnd();
        }
        startRef.current = null;
        draggingRef.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={(event) => {
        startRef.current = null;
        draggingRef.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
    />
  );
}

function TextEditorOverlay({
  element,
  onDraftChange,
  onCommit,
  onClose,
}: {
  element: CanvasElement;
  onDraftChange: (id: string, text: string) => void;
  onCommit: (text: string, heightPx: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(element.text ?? "");
  const [boxHeight, setBoxHeight] = useState(element.height);
  const valueRef = useRef(value);
  valueRef.current = value;
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const radius = element.cornerRadius ?? (element.type === "sticky" ? 12 : 6);

  const syncHeight = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const minHeight = Math.max(
      element.height,
      element.type === "sticky" ? 120 : 32,
    );
    node.style.height = "0px";
    const next = Math.max(minHeight, node.scrollHeight + 4);
    node.style.height = `${next}px`;
    setBoxHeight(next);
  }, [element.height, element.type]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    requestAnimationFrame(() => {
      syncHeight();
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    });
  }, [element.id, syncHeight]);

  return (
    <div
      className="pointer-events-auto absolute z-20"
      style={{
        ...elementOverlayStyle(element),
        height: boxHeight,
        minHeight: element.height,
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onDraftChange(element.id, event.target.value);
          requestAnimationFrame(syncHeight);
        }}
        onBlur={() => {
          const node = ref.current;
          const heightPx = node
            ? Math.max(
                element.height,
                element.type === "sticky" ? 120 : 32,
                node.scrollHeight + 4,
              )
            : boxHeight;
          onCommit(valueRef.current, heightPx);
          onClose();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            const node = ref.current;
            const heightPx = node
              ? Math.max(
                  element.height,
                  element.type === "sticky" ? 120 : 32,
                  node.scrollHeight + 4,
                )
              : boxHeight;
            onCommit(valueRef.current, heightPx);
            onClose();
          }
        }}
        placeholder={element.type === "sticky" ? "Note…" : "Type here…"}
        className="h-full min-h-full w-full resize-none overflow-hidden border-0 bg-transparent p-2 text-[#1e293b] outline-none"
        style={{
          fontSize: element.fontSize ?? 20,
          fontFamily: element.fontFamily ?? CANVAS_HAND_FONT,
          fontWeight: element.bold ? 700 : 400,
          fontStyle: element.italic ? "italic" : "normal",
          textDecoration: element.underline ? "underline" : "none",
          textAlign: element.textAlign ?? "left",
          color: element.strokeColor,
          lineHeight: 1.35,
          borderRadius: radius,
          minHeight: element.height,
        }}
      />
    </div>
  );
}

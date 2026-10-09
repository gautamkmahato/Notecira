"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const LOG_PREFIX = "[recreate-image/page]";
const HANDLE_SCREEN_PX = 10;
const MIN_SIZE = 16;

type LayerImage = {
  url: string;
  content_type?: string;
  file_name?: string;
  file_size?: number;
  width?: number | null;
  height?: number | null;
};

type BoundingBox = {
  absolute: number[];
  normalized?: number[];
};

type Layer = {
  image: LayerImage;
  z_index: number;
  bounding_box: BoundingBox | null;
  name: string | null;
  description: string | null;
};

type Payload = {
  images?: LayerImage[];
  layers: Layer[];
};

type PlacedLayer = {
  id: string;
  layer: Layer;
  src: string;
  image: HTMLImageElement;
  left: number;
  top: number;
  width: number;
  height: number;
  fullCanvas: boolean;
};

type HandleName =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w";

type DragState = {
  mode: "move" | "resize";
  handle?: HandleName;
  layerId: string;
  startX: number;
  startY: number;
  startBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

function log(message: string, data?: unknown) {
  if (data === undefined) {
    console.log(`${LOG_PREFIX} ${message}`);
    return;
  }

  console.log(`${LOG_PREFIX} ${message}`, data);
}

function proxyUrl(url: string) {
  return `/api/recreate-image/proxy?url=${encodeURIComponent(url)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image: ${src}`));
    img.src = src;
  });
}

function parseAbsoluteBox(box: BoundingBox) {
  const [left, top, right, bottom] = box.absolute;

  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

function isNear(a: number, b: number, slop = 16) {
  return Math.abs(a - b) <= slop;
}

function containsPoint(
  layer: PlacedLayer,
  x: number,
  y: number,
) {
  return (
    x >= layer.left &&
    y >= layer.top &&
    x <= layer.left + layer.width &&
    y <= layer.top + layer.height
  );
}

function handlePositions(layer: PlacedLayer, handleSize: number) {
  const { left, top, width, height } = layer;
  const midX = left + width / 2;
  const midY = top + height / 2;
  const right = left + width;
  const bottom = top + height;
  const half = handleSize / 2;

  return {
    nw: { x: left - half, y: top - half },
    n: { x: midX - half, y: top - half },
    ne: { x: right - half, y: top - half },
    e: { x: right - half, y: midY - half },
    se: { x: right - half, y: bottom - half },
    s: { x: midX - half, y: bottom - half },
    sw: { x: left - half, y: bottom - half },
    w: { x: left - half, y: midY - half },
  } satisfies Record<HandleName, { x: number; y: number }>;
}

function hitHandle(
  layer: PlacedLayer,
  x: number,
  y: number,
  handleSize: number,
): HandleName | null {
  const handles = handlePositions(layer, handleSize);

  for (const name of Object.keys(handles) as HandleName[]) {
    const handle = handles[name];
    if (
      x >= handle.x &&
      y >= handle.y &&
      x <= handle.x + handleSize &&
      y <= handle.y + handleSize
    ) {
      return name;
    }
  }

  return null;
}

function resizedBox(
  start: DragState["startBox"],
  handle: HandleName,
  dx: number,
  dy: number,
) {
  let { left, top, width, height } = start;
  const right = left + width;
  const bottom = top + height;

  if (handle.includes("e")) {
    width = Math.max(MIN_SIZE, width + dx);
  }
  if (handle.includes("s")) {
    height = Math.max(MIN_SIZE, height + dy);
  }
  if (handle.includes("w")) {
    const nextLeft = Math.min(right - MIN_SIZE, left + dx);
    width = right - nextLeft;
    left = nextLeft;
  }
  if (handle.includes("n")) {
    const nextTop = Math.min(bottom - MIN_SIZE, top + dy);
    height = bottom - nextTop;
    top = nextTop;
  }

  return { left, top, width, height };
}

function cursorForHandle(handle: HandleName) {
  if (handle === "n" || handle === "s") {
    return "ns-resize";
  }
  if (handle === "e" || handle === "w") {
    return "ew-resize";
  }
  if (handle === "ne" || handle === "sw") {
    return "nesw-resize";
  }
  return "nwse-resize";
}

export default function RecreateImagePage() {
  const [rawJson, setRawJson] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [placedLayers, setPlacedLayers] = useState<PlacedLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layersRef = useRef<PlacedLayer[]>([]);
  const selectedRef = useRef<string | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const previewScale = useMemo(() => {
    if (canvasSize.width <= 0) {
      return 1;
    }

    return Math.min(1, 900 / canvasSize.width);
  }, [canvasSize.width]);

  const handleSize = HANDLE_SCREEN_PX / previewScale;

  layersRef.current = placedLayers;
  selectedRef.current = selectedId;

  function paint(
    layers = layersRef.current,
    selected = selectedRef.current,
  ) {
    const canvas = canvasRef.current;

    if (!canvas || canvasSize.width <= 0) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ordered = [...layers].sort(
      (a, b) => a.layer.z_index - b.layer.z_index,
    );

    for (const entry of ordered) {
      ctx.drawImage(
        entry.image,
        entry.left,
        entry.top,
        entry.width,
        entry.height,
      );
    }

    const selectedLayer = ordered.find((entry) => entry.id === selected);

    if (selectedLayer) {
      ctx.save();
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 2 / previewScale;
      ctx.setLineDash([8 / previewScale, 6 / previewScale]);
      ctx.strokeRect(
        selectedLayer.left,
        selectedLayer.top,
        selectedLayer.width,
        selectedLayer.height,
      );
      ctx.setLineDash([]);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 1.5 / previewScale;

      const handles = handlePositions(selectedLayer, handleSize);
      for (const handle of Object.values(handles)) {
        ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
        ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
      }

      ctx.restore();
    }

    if (!dragRef.current) {
      setResultUrl(canvas.toDataURL("image/png"));
    }
  }

  useEffect(() => {
    paint();
  }, [placedLayers, selectedId, canvasSize, previewScale]);

  function canvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function layerAtPoint(x: number, y: number) {
    const ordered = [...layersRef.current].sort(
      (a, b) => b.layer.z_index - a.layer.z_index,
    );

    return ordered.find((entry) => containsPoint(entry, x, y)) ?? null;
  }

  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const { x, y } = canvasPoint(event);
    const selected = layersRef.current.find(
      (entry) => entry.id === selectedRef.current,
    );

    if (selected) {
      const handle = hitHandle(selected, x, y, handleSize);

      if (handle) {
        dragRef.current = {
          mode: "resize",
          handle,
          layerId: selected.id,
          startX: x,
          startY: y,
          startBox: {
            left: selected.left,
            top: selected.top,
            width: selected.width,
            height: selected.height,
          },
        };
        canvas.setPointerCapture(event.pointerId);
        event.preventDefault();
        return;
      }
    }

    const hit = layerAtPoint(x, y);
    setSelectedId(hit?.id ?? null);

    if (!hit) {
      return;
    }

    dragRef.current = {
      mode: "move",
      layerId: hit.id,
      startX: x,
      startY: y,
      startBox: {
        left: hit.left,
        top: hit.top,
        width: hit.width,
        height: hit.height,
      },
    };
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const drag = dragRef.current;
    const { x, y } = canvasPoint(event);

    if (!drag) {
      const selected = layersRef.current.find(
        (entry) => entry.id === selectedRef.current,
      );
      let nextCursor = "default";

      if (selected) {
        const handle = hitHandle(selected, x, y, handleSize);
        if (handle) {
          nextCursor = cursorForHandle(handle);
        } else if (containsPoint(selected, x, y)) {
          nextCursor = "move";
        } else if (layerAtPoint(x, y)) {
          nextCursor = "pointer";
        }
      } else if (layerAtPoint(x, y)) {
        nextCursor = "pointer";
      }

      if (canvas) {
        canvas.style.cursor = nextCursor;
      }

      return;
    }

    const dx = x - drag.startX;
    const dy = y - drag.startY;

    setPlacedLayers((current) =>
      current.map((entry) => {
        if (entry.id !== drag.layerId) {
          return entry;
        }

        if (drag.mode === "move") {
          return {
            ...entry,
            left: drag.startBox.left + dx,
            top: drag.startBox.top + dy,
          };
        }

        const next = resizedBox(
          drag.startBox,
          drag.handle ?? "se",
          dx,
          dy,
        );

        return {
          ...entry,
          ...next,
        };
      }),
    );

    if (canvas) {
      canvas.style.cursor =
        drag.mode === "move"
          ? "move"
          : cursorForHandle(drag.handle ?? "se");
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (canvas && dragRef.current) {
      canvas.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
    exportPng();
  }

  function exportPng() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    setResultUrl(canvas.toDataURL("image/png"));
  }

  function deleteSelected() {
    if (!selectedRef.current) {
      return;
    }

    const id = selectedRef.current;
    setPlacedLayers((current) =>
      current.filter((entry) => entry.id !== id),
    );
    setSelectedId(null);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedRef.current
      ) {
        const target = event.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "TEXTAREA" || target.tagName === "INPUT")
        ) {
          return;
        }

        event.preventDefault();
        deleteSelected();
      }

      if (event.key === "Escape") {
        setSelectedId(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function reconstruct() {
    setError("");
    setStatus("Parsing layer data...");
    setLoading(true);
    setResultUrl(null);
    setPlacedLayers([]);
    setSelectedId(null);

    try {
      const payload = JSON.parse(rawJson) as Payload;

      if (!Array.isArray(payload.layers) || payload.layers.length === 0) {
        throw new Error("JSON must include a layers array");
      }

      const layers = [...payload.layers].sort(
        (a, b) => a.z_index - b.z_index,
      );
      const baseLayer =
        layers.find((layer) => !layer.bounding_box) ?? layers[0];

      setStatus("Loading layer images...");

      const loaded = await Promise.all(
        layers.map(async (layer) => {
          const src = proxyUrl(layer.image.url);
          const image = await loadImage(src);
          return { layer, src, image };
        }),
      );

      const base = loaded.find(
        (entry) => entry.layer === baseLayer,
      ) ?? loaded[0];

      const width = base.image.naturalWidth;
      const height = base.image.naturalHeight;

      const maxX = Math.max(
        width,
        ...layers
          .filter((layer) => layer.bounding_box)
          .map((layer) => layer.bounding_box!.absolute[2] ?? 0),
      );
      const maxY = Math.max(
        height,
        ...layers
          .filter((layer) => layer.bounding_box)
          .map((layer) => layer.bounding_box!.absolute[3] ?? 0),
      );
      const scaleX = maxX > width * 1.05 ? width / maxX : 1;
      const scaleY = maxY > height * 1.05 ? height / maxY : 1;

      const nextPlaced: PlacedLayer[] = [];

      nextPlaced.push({
        id: `layer-0-${base.layer.z_index}`,
        layer: base.layer,
        src: base.src,
        image: base.image,
        left: 0,
        top: 0,
        width,
        height,
        fullCanvas: true,
      });

      loaded.forEach((entry, index) => {
        if (entry.layer === base.layer) {
          return;
        }

        const box = entry.layer.bounding_box
          ? parseAbsoluteBox(entry.layer.bounding_box)
          : null;
        const id = `layer-${index}-${entry.layer.z_index}`;

        if (!box) {
          nextPlaced.push({
            id,
            layer: entry.layer,
            src: entry.src,
            image: entry.image,
            left: 0,
            top: 0,
            width,
            height,
            fullCanvas: true,
          });
          return;
        }

        const left = box.left * scaleX;
        const top = box.top * scaleY;
        const boxWidth = box.width * scaleX;
        const boxHeight = box.height * scaleY;
        const fullCanvas =
          isNear(entry.image.naturalWidth, width) &&
          isNear(entry.image.naturalHeight, height);

        if (fullCanvas) {
          nextPlaced.push({
            id,
            layer: entry.layer,
            src: entry.src,
            image: entry.image,
            left: 0,
            top: 0,
            width,
            height,
            fullCanvas: true,
          });
          return;
        }

        nextPlaced.push({
          id,
          layer: entry.layer,
          src: entry.src,
          image: entry.image,
          left,
          top,
          width: boxWidth,
          height: boxHeight,
          fullCanvas: false,
        });
      });

      setPlacedLayers(nextPlaced);
      setCanvasSize({ width, height });
      setStatus(
        `Reconstructed ${layers.length} layers · ${width}×${height}. Click a section to edit.`,
      );

      log("reconstructed", {
        layerCount: layers.length,
        width,
        height,
      });
    } catch (caught) {
      console.error(`${LOG_PREFIX} reconstruct failed`, caught);
      setError(
        caught instanceof Error
          ? caught.message
          : "Failed to reconstruct image",
      );
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  const selectedLayer = placedLayers.find(
    (entry) => entry.id === selectedId,
  );

  return (
    <main
      style={{
        height: "100vh",
        overflowY: "auto",
        boxSizing: "border-box",
        background: "#111",
        color: "#fff",
        padding: 40,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>Recreate Image</h1>
        <p
          style={{
            color: "#999",
            marginTop: 8,
            marginBottom: 24,
          }}
        >
          Paste segregated layer JSON and reconstruct the design by z-index
          and bounding boxes. Click a section to drag, resize, or delete it.
        </p>

        <textarea
          value={rawJson}
          onChange={(event) => setRawJson(event.target.value)}
          placeholder='Paste {"images":[...],"layers":[...]} JSON'
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: 220,
            boxSizing: "border-box",
            background: "#1c1c1c",
            color: "#e5e5e5",
            border: "1px solid #333",
            borderRadius: 12,
            padding: 16,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 12,
            lineHeight: 1.45,
            marginBottom: 16,
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={reconstruct}
            disabled={loading || !rawJson.trim()}
            style={{
              border: 0,
              borderRadius: 8,
              padding: "12px 20px",
              background:
                loading || !rawJson.trim() ? "#444" : "#7c3aed",
              color: "#fff",
              fontWeight: 600,
              cursor:
                loading || !rawJson.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Reconstructing..." : "Reconstruct image"}
          </button>

          {resultUrl ? (
            <a
              href={resultUrl}
              download="recreated-image.png"
              style={{
                background: "#fff",
                color: "#111",
                padding: "12px 18px",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Download PNG
            </a>
          ) : null}

          {selectedLayer ? (
            <button
              type="button"
              onClick={deleteSelected}
              style={{
                border: 0,
                borderRadius: 8,
                padding: "12px 18px",
                background: "#b91c1c",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Delete section
            </button>
          ) : null}

          <span style={{ color: "#999", fontSize: 14 }}>{status}</span>
        </div>

        {error ? (
          <div
            style={{
              background: "#3a1111",
              border: "1px solid #6b2222",
              padding: 15,
              borderRadius: 8,
              color: "#ff7777",
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        ) : null}

        {canvasSize.width > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 320px",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div
              style={{
                background: "#222",
                borderRadius: 12,
                padding: 20,
                overflow: "auto",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: 15,
                  color: "#ccc",
                }}
              >
                Reconstructed image
              </h3>

              <div
                style={{
                  width: canvasSize.width * previewScale,
                  height: canvasSize.height * previewScale,
                  position: "relative",
                  margin: "0 auto",
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  style={{
                    display: "block",
                    width: canvasSize.width * previewScale,
                    height: canvasSize.height * previewScale,
                    borderRadius: 8,
                    touchAction: "none",
                    background: "#000",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                background: "#1c1c1c",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: 15,
                  color: "#ccc",
                }}
              >
                Layers
              </h3>

              <div style={{ display: "grid", gap: 8 }}>
                {placedLayers.map((entry) => {
                  const active = entry.id === selectedId;

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setSelectedId(entry.id)}
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: active
                          ? "1px solid #7c3aed"
                          : "1px solid #333",
                        background: active ? "#2a1f4a" : "#181818",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      <div style={{ color: "#a855f7", fontWeight: 600 }}>
                        z{entry.layer.z_index}{" "}
                        {entry.layer.name || "Background"}
                      </div>
                      <div style={{ color: "#888", marginTop: 4 }}>
                        {Math.round(entry.left)},{Math.round(entry.top)} ·{" "}
                        {Math.round(entry.width)}×{Math.round(entry.height)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

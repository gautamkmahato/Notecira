import {
  elementCornerRadius,
  stickyFill,
  strokeDashArray,
} from "./element-meta";
import { getLineEndpoints } from "./line-geometry";
import { CANVAS_HAND_FONT, type CanvasElement } from "./types";

const strokeProps = {
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function textDivStyle(element: CanvasElement) {
  const fontFamily = element.fontFamily ?? CANVAS_HAND_FONT;
  const fontSize = element.fontSize ?? 20;

  return {
    width: "100%",
    height: "100%",
    color: element.strokeColor,
    fontSize,
    fontFamily,
    fontWeight: element.bold ? 700 : 400,
    fontStyle: element.italic ? "italic" : "normal",
    textDecoration: element.underline ? "underline" : "none",
    textAlign: element.textAlign ?? "left",
    lineHeight: 1.35,
    overflow: "hidden" as const,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    padding: 2,
    boxSizing: "border-box" as const,
    pointerEvents: "none" as const,
  };
}

function shapeStroke(element: CanvasElement) {
  return {
    stroke: element.strokeColor,
    strokeWidth: element.strokeWidth,
    strokeDasharray: strokeDashArray(element.strokeStyle),
    ...strokeProps,
  };
}

function renderArrowHead(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeColor: string,
  stroke: ReturnType<typeof shapeStroke>,
) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = Math.min(18, Math.max(10, dist * 0.18));
  const lineEndX = x2 - head * Math.cos(angle);
  const lineEndY = y2 - head * Math.sin(angle);
  const leftX = x2 - head * Math.cos(angle - Math.PI / 6);
  const leftY = y2 - head * Math.sin(angle - Math.PI / 6);
  const rightX = x2 - head * Math.cos(angle + Math.PI / 6);
  const rightY = y2 - head * Math.sin(angle + Math.PI / 6);

  return (
    <g fill="none" {...stroke}>
      <line x1={x1} y1={y1} x2={lineEndX} y2={lineEndY} />
      <polygon
        points={`${x2},${y2} ${leftX},${leftY} ${rightX},${rightY}`}
        fill={strokeColor}
        stroke="none"
      />
    </g>
  );
}

export function renderCanvasElementSvg(
  element: CanvasElement,
  options?: { hideText?: boolean; draftPreview?: boolean },
) {
  const radius = elementCornerRadius(element);
  const stroke = shapeStroke(element);
  const fill =
    element.fillColor === "transparent" ? "none" : element.fillColor;

  switch (element.type) {
    case "rectangle":
    case "square":
      return (
        <rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rx={radius}
          ry={radius}
          fill={fill}
          {...stroke}
        />
      );
    case "decision": {
      const cx = element.x + element.width / 2;
      const cy = element.y + element.height / 2;
      const points = `${cx},${element.y} ${element.x + element.width},${cy} ${cx},${element.y + element.height} ${element.x},${cy}`;
      return <polygon points={points} fill={fill} {...stroke} />;
    }
    case "circle":
      return (
        <ellipse
          cx={element.x + element.width / 2}
          cy={element.y + element.height / 2}
          rx={element.width / 2}
          ry={element.height / 2}
          fill={fill}
          {...stroke}
        />
      );
    case "line": {
      const { x1, y1, x2, y2 } = getLineEndpoints(element);
      return <line x1={x1} y1={y1} x2={x2} y2={y2} {...stroke} />;
    }
    case "arrow": {
      const { x1, y1, x2, y2 } = getLineEndpoints(element);
      return renderArrowHead(x1, y1, x2, y2, element.strokeColor, stroke);
    }
    case "sticky":
      if (options?.draftPreview || options?.hideText) {
        return (
          <rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rx={radius}
            ry={radius}
            fill={stickyFill(element)}
            {...stroke}
          />
        );
      }
      return (
        <g>
          <rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rx={radius}
            ry={radius}
            fill={stickyFill(element)}
            {...stroke}
          />
          {!options?.hideText && element.text ? (
            <foreignObject
              x={element.x + 10}
              y={element.y + 10}
              width={element.width - 20}
              height={element.height - 20}
            >
              <div style={textDivStyle(element)}>{element.text}</div>
            </foreignObject>
          ) : null}
        </g>
      );
    case "image":
      if (!element.imageSrc) {
        return null;
      }
      return (
        <image
          href={element.imageSrc}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          preserveAspectRatio="none"
        />
      );
    case "text":
      if (options?.draftPreview || options?.hideText) {
        return (
          <rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rx={radius}
            ry={radius}
            fill={
              element.fillColor === "transparent" ? "none" : element.fillColor
            }
            {...stroke}
          />
        );
      }
      return (
        <foreignObject
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
        >
          <div style={textDivStyle(element)}>{element.text || "\u00a0"}</div>
        </foreignObject>
      );
    default:
      return null;
  }
}

export function selectionOutline(
  element: CanvasElement,
  options?: { grouped?: boolean },
) {
  const radius = Math.max(4, elementCornerRadius(element));
  const grouped = options?.grouped;
  return (
    <rect
      x={element.x - 2}
      y={element.y - 2}
      width={element.width + 4}
      height={element.height + 4}
      fill="none"
      stroke={grouped ? "#84a2ff" : "#6965db"}
      strokeWidth={grouped ? 1 : 1.5}
      rx={radius}
      pointerEvents="none"
    />
  );
}

export function groupSelectionOutline(bounds: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return (
    <rect
      x={bounds.x - 6}
      y={bounds.y - 6}
      width={bounds.width + 12}
      height={bounds.height + 12}
      fill="none"
      stroke="#6965db"
      strokeWidth={1.5}
      strokeDasharray="6 4"
      rx={4}
      pointerEvents="none"
    />
  );
}

export function marqueeOutline(box: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return (
    <rect
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      fill="rgba(105, 101, 219, 0.08)"
      stroke="#6965db"
      strokeWidth={1}
      strokeDasharray="4 3"
      pointerEvents="none"
    />
  );
}

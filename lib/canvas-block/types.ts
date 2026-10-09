export type CanvasMode = "infinite" | "doc_width";

export type CanvasTool =
  | "select"
  | "text"
  | "rectangle"
  | "decision"
  | "circle"
  | "arrow"
  | "line"
  | "sticky"
  | "eraser";

export type CanvasShapeType =
  | "text"
  | "rectangle"
  | "square"
  | "decision"
  | "circle"
  | "arrow"
  | "line"
  | "sticky"
  | "image";

export type CanvasStrokeStyle = "solid" | "dashed" | "dotted";

export type CanvasTextAlign = "left" | "center" | "right";

export type CanvasElement = {
  id: string;
  type: CanvasShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle?: CanvasStrokeStyle;
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: CanvasTextAlign;
  /** Line / arrow endpoints in canvas coordinates */
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  /** Data URL or remote URL for image elements */
  imageSrc?: string;
};

export const CANVAS_DEFAULT_STROKE = "#1e293b";
export const CANVAS_DEFAULT_FILL = "transparent";
export const CANVAS_STICKY_FILL = "#fef08a";
export const CANVAS_DEFAULT_STROKE_WIDTH = 2;
export const CANVAS_SHAPE_RADIUS = 6;
export const CANVAS_HAND_FONT =
  '"Comic Neue", "Segoe Print", "Bradley Hand", cursive';
export const CANVAS_MIN_SIZE = 8;
export const CANVAS_INFINITE_SIZE = 3200;
export const CANVAS_DOC_MIN_HEIGHT = 360;

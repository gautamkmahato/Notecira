import { CANVAS_MIN_SIZE } from "./types";

export const CANVAS_IMAGE_MAX_DIMENSION = 480;

export function fitImageDisplaySize(
  naturalWidth: number,
  naturalHeight: number,
  maxDimension = CANVAS_IMAGE_MAX_DIMENSION,
): { width: number; height: number } {
  const nw = Math.max(1, naturalWidth);
  const nh = Math.max(1, naturalHeight);
  const scale = Math.min(1, maxDimension / Math.max(nw, nh));

  return {
    width: Math.max(CANVAS_MIN_SIZE, Math.round(nw * scale)),
    height: Math.max(CANVAS_MIN_SIZE, Math.round(nh * scale)),
  };
}

export function loadImageFromSource(src: string): Promise<{
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        src,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      });
    };
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Invalid file data"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

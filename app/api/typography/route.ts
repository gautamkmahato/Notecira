import { NextResponse } from "next/server";

const LOG_PREFIX = "[api/typography]";
const MODEL_ID = "openai/gpt-5.6-luna";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function log(message: string, data?: unknown) {
  if (data === undefined) {
    console.log(`${LOG_PREFIX} ${message}`);
    return;
  }

  console.log(`${LOG_PREFIX} ${message}`, data);
}

type BBox = {
  topLeftX: number;
  topLeftY: number;
  bottomRightX: number;
  bottomRightY: number;
};

type TypographyRequestBody = {
  imageDataUrl?: string;
  imageSize?: {
    width: number;
    height: number;
  };
  items?: Array<{
    text?: string;
    bbox?: BBox;
    bboxWidth?: number;
    bboxHeight?: number;
  }>;
};

type TextStyle = {
  text: string;
  font_family: string;
  font_size: number;
  font_weight: number;
  color: string;
  letter_spacing: number;
  line_height: number;
  alignment: string;
};

function parseStyles(raw: string): TextStyle[] {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as unknown;

  if (Array.isArray(parsed)) {
    return parsed as TextStyle[];
  }

  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;

    if (Array.isArray(record.styles)) {
      return record.styles as TextStyle[];
    }

    if (Array.isArray(record.items)) {
      return record.items as TextStyle[];
    }
  }

  throw new Error("Model did not return a JSON array of typography values");
}

function normalizeStyle(
  raw: unknown,
  fallbackText: string,
): TextStyle | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const entry = raw as Record<string, unknown>;

  const text =
    typeof entry.text === "string" && entry.text.trim()
      ? entry.text
      : fallbackText;

  const fontFamily =
    typeof entry.font_family === "string" && entry.font_family.trim()
      ? entry.font_family.trim()
      : "Arial";

  const fontSize = Number(entry.font_size);
  const fontWeight = Number(entry.font_weight);
  const letterSpacing = Number(entry.letter_spacing);
  const lineHeight = Number(entry.line_height);

  const color =
    typeof entry.color === "string" && entry.color.trim()
      ? entry.color.trim()
      : "#111111";

  const alignmentRaw =
    typeof entry.alignment === "string"
      ? entry.alignment.trim().toLowerCase()
      : "left";

  const alignment =
    alignmentRaw === "center" || alignmentRaw === "right"
      ? alignmentRaw
      : "left";

  return {
    text,
    font_family: fontFamily,
    font_size: Number.isFinite(fontSize) ? fontSize : 16,
    font_weight: Number.isFinite(fontWeight) ? fontWeight : 400,
    color,
    letter_spacing: Number.isFinite(letterSpacing) ? letterSpacing : 0,
    line_height: Number.isFinite(lineHeight) ? lineHeight : 1.2,
    alignment,
  };
}

export async function POST(req: Request) {
  log("POST request received");

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      log("OPENROUTER_API_KEY is missing");

      return NextResponse.json(
        {
          error: "OPENROUTER_API_KEY is not configured",
        },
        { status: 500 },
      );
    }

    const body = (await req.json()) as TypographyRequestBody;
    const { imageDataUrl, imageSize, items } = body;

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return NextResponse.json(
        { error: "imageDataUrl is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items with text and bbox are required" },
        { status: 400 },
      );
    }

    const payloadItems = items.map((item, index) => {
      const bbox = item.bbox;
      const bboxWidth =
        item.bboxWidth ??
        (bbox ? bbox.bottomRightX - bbox.topLeftX : 0);
      const bboxHeight =
        item.bboxHeight ??
        (bbox ? bbox.bottomRightY - bbox.topLeftY : 0);

      return {
        index,
        text: item.text ?? "",
        bbox: bbox ?? null,
        bbox_width: bboxWidth,
        bbox_height: bboxHeight,
      };
    });

    const prompt = `You are extracting exact CSS typography from a graphic-design image.

You will receive:
1. The ORIGINAL design image.
2. Detected text items with bounding boxes in ORIGINAL IMAGE PIXEL coordinates.

Image size: ${imageSize?.width ?? 0} x ${imageSize?.height ?? 0} px.

Text items:
${JSON.stringify(payloadItems)}

For EACH item, look at the image at that exact bbox and return the visible typography.

Rules:
- Keep the same order as the input items. One object per item. Same text string.
- font_size MUST be the true rendered pixel size of the glyphs.
- Use the bbox as the measuring tool for font_size:
  - Single-line text: font_size is approximately bbox_height (slightly less only if the box has padding around the glyphs).
  - Multi-line text: font_size ≈ bbox_height / (number_of_lines * line_height).
- Do not invent a generic size. Measure from the bbox and the image.
- color must be a hex color of the visible text, like #111111 or #D9FF00.
- font_family: closest real family you can identify (Arial, Helvetica, Impact, Georgia, Times New Roman, etc.).
- font_weight: numeric 100-900.
- letter_spacing: pixels, 0 if none.
- line_height: unitless multiplier such as 1.2.
- alignment: left, center, or right.

Return ONLY a JSON array. No markdown. No commentary. No extra keys. Each object must be exactly:
{
  "text": "The future of speed is here.",
  "font_family": "Arial",
  "font_size": 16,
  "font_weight": 400,
  "color": "#111111",
  "letter_spacing": 0,
  "line_height": 1.2,
  "alignment": "left"
}`;

    log("calling OpenRouter", {
      model: MODEL_ID,
      itemCount: payloadItems.length,
      imageDataUrlLength: imageDataUrl.length,
    });

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-OpenRouter-Title": "recreate-text",
      },
      body: JSON.stringify({
        model: MODEL_ID,
        temperature: 0,
        max_tokens: 8000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
      }),
    });

    const rawText = await response.text();

    log("OpenRouter HTTP response", {
      status: response.status,
      ok: response.ok,
      responseBytes: rawText.length,
    });

    if (!response.ok) {
      log("OpenRouter API error", rawText);

      return NextResponse.json(
        {
          error: `OpenRouter API error ${response.status}`,
          details: rawText,
        },
        { status: response.status },
      );
    }

    let data: {
      choices?: Array<{
        message?: {
          content?: string | Array<{ type?: string; text?: string }>;
        };
      }>;
    };

    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          error: "OpenRouter returned invalid JSON",
          raw: rawText,
        },
        { status: 500 },
      );
    }

    const content = data.choices?.[0]?.message?.content;
    const contentText =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content
              .map((part) =>
                typeof part?.text === "string" ? part.text : "",
              )
              .join("")
          : "";

    if (!contentText.trim()) {
      log("empty model content", data);

      return NextResponse.json(
        { error: "Model returned empty typography output" },
        { status: 502 },
      );
    }

    const parsed = parseStyles(contentText);

    const styles = parsed
      .map((entry, index) =>
        normalizeStyle(entry, payloadItems[index]?.text ?? ""),
      )
      .filter(Boolean) as TextStyle[];

    log("typography extracted", {
      count: styles.length,
    });

    return NextResponse.json({
      styles,
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} typography failed`, error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Typography extraction failed",
      },
      { status: 500 },
    );
  }
}

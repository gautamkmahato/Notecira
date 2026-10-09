import { NextResponse } from "next/server";

const LOG_PREFIX = "[api/refine-html]";
const MODEL_ID = "google/gemini-3.7-flash";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function log(message: string, data?: unknown) {
  if (data === undefined) {
    console.log(`${LOG_PREFIX} ${message}`);
    return;
  }

  console.log(`${LOG_PREFIX} ${message}`, data);
}

type RefineRequestBody = {
  originalImageDataUrl?: string;
  generatedImageDataUrl?: string;
  html?: string;
  width?: number;
  height?: number;
};

function extractHtml(raw: string): string {
  let cleaned = raw
    .trim()
    .replace(/^```(?:html|HTML)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const doctype = cleaned.search(/<!DOCTYPE html/i);
  const htmlTag = cleaned.search(/<html[\s>]/i);
  const divTag = cleaned.search(/<div[\s>]/i);
  const starts = [doctype, htmlTag, divTag].filter((index) => index >= 0);

  if (starts.length > 0) {
    cleaned = cleaned.slice(Math.min(...starts)).trim();
  }

  if (!cleaned.includes("<")) {
    throw new Error("Model did not return HTML");
  }

  return cleaned;
}

export async function POST(req: Request) {
  log("POST request received");

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      log("OPENROUTER_API_KEY is missing");

      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as RefineRequestBody;
    const {
      originalImageDataUrl,
      generatedImageDataUrl,
      html,
      width,
      height,
    } = body;

    if (!originalImageDataUrl || !generatedImageDataUrl) {
      return NextResponse.json(
        { error: "originalImageDataUrl and generatedImageDataUrl are required" },
        { status: 400 },
      );
    }

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: "html is required" },
        { status: 400 },
      );
    }

    const prompt = `You are a pixel-perfect email/design reconstruction editor.

You will receive:
1. ORIGINAL IMAGE — the ground-truth design.
2. GENERATED IMAGE — our current recreation.
3. CURRENT HTML — the overlay used to produce the generated image. Coordinates are in pixels for a canvas of ${width ?? 0} x ${height ?? 0}.

Task:
Compare the generated image to the original image. Fix remaining issues in the HTML so the overlay matches the original 100%:
- text size / font-size
- text alignment
- padding and margin
- text color
- font-weight
- letter-spacing
- line-height
- left/top/width/height so every line sits in the exact same place as the original

Rules:
- Keep every real text string. Do not drop copy.
- Do not add new marketing text.
- Do not include images, scripts, markdown, or comments.
- Do not wrap the overlay in <html> or <body>.
- The root must be a single <div> with position:relative and width/height exactly ${width ?? 0}px x ${height ?? 0}px.
- Each text node must be position:absolute with inline styles only.
- Use pixel units.

Return ONLY the final HTML. No markdown fences. No explanation.`;

    log("calling OpenRouter", {
      model: MODEL_ID,
      htmlLength: html.length,
      originalBytes: originalImageDataUrl.length,
      generatedBytes: generatedImageDataUrl.length,
    });

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-OpenRouter-Title": "recreate-text-refine",
      },
      body: JSON.stringify({
        model: MODEL_ID,
        temperature: 0,
        max_tokens: 16000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "text",
                text: "ORIGINAL IMAGE:",
              },
              {
                type: "image_url",
                image_url: {
                  url: originalImageDataUrl,
                },
              },
              {
                type: "text",
                text: "GENERATED IMAGE:",
              },
              {
                type: "image_url",
                image_url: {
                  url: generatedImageDataUrl,
                },
              },
              {
                type: "text",
                text: `CURRENT HTML:\n${html}`,
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
      return NextResponse.json(
        { error: "Model returned empty HTML" },
        { status: 502 },
      );
    }

    const refinedHtml = extractHtml(contentText);

    log("refine html extracted", {
      htmlLength: refinedHtml.length,
    });

    return NextResponse.json({
      html: refinedHtml,
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} refine failed`, error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "HTML refine failed",
      },
      { status: 500 },
    );
  }
}

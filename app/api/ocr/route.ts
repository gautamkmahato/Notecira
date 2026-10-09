import { NextResponse } from "next/server";

const LOG_PREFIX = "[api/ocr]";

function log(message: string, data?: unknown) {
  if (data === undefined) {
    console.log(`${LOG_PREFIX} ${message}`);
    return;
  }

  console.log(`${LOG_PREFIX} ${message}`, data);
}

export async function POST(req: Request) {
  log("POST request received");

  try {
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      log("MISTRAL_API_KEY is missing");

      return NextResponse.json(
        {
          error: "MISTRAL_API_KEY is not configured",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // Receive image
    // --------------------------------------------------

    const formData = await req.formData();

    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No image uploaded",
        },
        { status: 400 }
      );
    }

    log("image received", {
      name: file.name,
      type: file.type,
      sizeBytes: file.size,
    });

    // --------------------------------------------------
    // Convert image to base64
    // --------------------------------------------------

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const base64 =
      buffer.toString("base64");

    const mimeType =
      file.type || "image/png";

    const imageDataUrl =
      `data:${mimeType};base64,${base64}`;

    // --------------------------------------------------
    // Request
    // --------------------------------------------------

    const requestBody = {
      model: "mistral-ocr-4-1",

      document: {
        type: "image_url",
        image_url: imageDataUrl,
      },

      /*
       * Keep native OCR blocks.
       *
       * These are useful as our ground-truth-ish
       * OCR output and provide native coordinates.
       */
      include_blocks: true,

      /*
       * We don't actually need word confidence
       * right now, so keep the response smaller.
       */
      confidence_scores_granularity: "block",

      /*
       * Ask Mistral to additionally reason about
       * the image as a DESIGN and return individual
       * visual text elements.
       */
      document_annotation_format: {
        type: "json_schema",

        json_schema: {
          name: "design_text_elements",

          strict: true,

          schema: {
            type: "object",

            properties: {
              text_elements: {
                type: "array",

                description:
                  "Every visually distinct text element in the design.",

                items: {
                  type: "object",

                  properties: {
                    text: {
                      type: "string",

                      description:
                        "The exact visible text.",
                    },

                    bbox: {
                      type: "array",

                      description:
                        "Tight bounding box around the visible text in original image pixel coordinates: [left, top, right, bottom].",

                      items: {
                        type: "number",
                      },

                      minItems: 4,
                      maxItems: 4,
                    },

                    role: {
                      type: "string",

                      enum: [
                        "title",
                        "heading",
                        "subheading",
                        "body",
                        "button",
                        "navigation",
                        "label",
                        "caption",
                        "footer",
                        "other",
                      ],
                    },
                  },

                  required: [
                    "text",
                    "bbox",
                    "role",
                  ],

                  additionalProperties: false,
                },
              },
            },

            required: [
              "text_elements",
            ],

            additionalProperties: false,
          },
        },
      },

      document_annotation_prompt: `
You are analyzing a marketing email / graphic design.

Your task is to identify EVERY visually distinct text element
that a graphic-design editor should make independently editable.

IMPORTANT:

1. Return the exact visible text.
2. Each visually distinct text element must have its own object.
3. Do NOT return one large paragraph box when the design visually
   contains multiple separate text elements.
4. Treat visually separate headings as separate elements.
5. Treat "NIKE AIR" as ONE text element.
6. Treat "PEGASUS 41" as ONE text element.
7. Treat "SHOP NOW" as ONE text element.
8. Treat each navigation item separately:
   MEN, WOMEN, KIDS, CUSTOMIZE, NIKE APP.
9. Treat button text as its own text element.
10. Treat body paragraphs as one element when they are visually
    one paragraph.
11. If a paragraph contains multiple visual lines but is one
    typographic element, keep it as one element.
12. Do not include logos or icons unless they contain readable text.
13. Do not include decorative graphics.
14. Do not include the background.
15. Do not include the product/shoe as text.
16. Do not merge text elements merely because they are close.
17. Do not split a single large heading into individual words.
18. Bounding boxes must be tight around the visible text.
19. Do NOT add padding.
20. Coordinates must refer to the ORIGINAL IMAGE dimensions.
21. bbox format MUST be:
    [left, top, right, bottom]
22. Use pixel coordinates.
23. Return only text that is actually visible in the image.
24. Preserve capitalization exactly.

Think like a graphic-design editor rather than a traditional document OCR system.

For example:

"NIKE AIR"

should be:

{
  "text": "NIKE AIR",
  "bbox": [x1, y1, x2, y2],
  "role": "heading"
}

NOT:

{
  "text": "NIKE",
  ...
}

and another object for:

{
  "text": "AIR",
  ...
}

Likewise:

"PEGASUS 41"

must be a single text element.
`,
    };

    log("calling Mistral OCR 4.1");

    // --------------------------------------------------
    // Call Mistral
    // --------------------------------------------------

    const response = await fetch(
      "https://api.mistral.ai/v1/ocr",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify(requestBody),
      }
    );

    const rawText =
      await response.text();

    log("Mistral HTTP response", {
      status: response.status,
      ok: response.ok,
      responseBytes:
        rawText.length,
    });

    if (!response.ok) {
      log(
        "Mistral API error",
        rawText
      );

      return NextResponse.json(
        {
          error:
            `Mistral API error ${response.status}`,
          details: rawText,
        },
        {
          status: response.status,
        }
      );
    }

    let data: any;

    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          error:
            "Mistral returned invalid JSON",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // Native OCR page
    // --------------------------------------------------

    const page =
      data.pages?.[0];

    if (!page) {
      log("Mistral returned no pages");

      return NextResponse.json({
        width: 0,
        height: 0,
        blocks: [],
        textElements: [],
        markdown: "",
      });
    }

    // --------------------------------------------------
    // Normalize native OCR blocks
    // --------------------------------------------------

    const blocks =
      Array.isArray(page.blocks)
        ? page.blocks
            .map((block: any) => {
              return {
                label:
                  typeof block.type ===
                  "string"
                    ? block.type
                    : undefined,

                text:
                  typeof block.content ===
                  "string"
                    ? block.content
                    : undefined,

                bbox: {
                  topLeftX:
                    Number(
                      block.top_left_x ??
                        block.topLeftX
                    ),

                  topLeftY:
                    Number(
                      block.top_left_y ??
                        block.topLeftY
                    ),

                  bottomRightX:
                    Number(
                      block.bottom_right_x ??
                        block.bottomRightX
                    ),

                  bottomRightY:
                    Number(
                      block.bottom_right_y ??
                        block.bottomRightY
                    ),
                },

                confidence:
                  block.confidence_scores ??
                  block.confidenceScores ??
                  null,
              };
            })
            .filter((block: any) => {
              const b =
                block.bbox;

              return (
                Number.isFinite(
                  b.topLeftX
                ) &&
                Number.isFinite(
                  b.topLeftY
                ) &&
                Number.isFinite(
                  b.bottomRightX
                ) &&
                Number.isFinite(
                  b.bottomRightY
                ) &&
                b.bottomRightX >
                  b.topLeftX &&
                b.bottomRightY >
                  b.topLeftY
              );
            })
        : [];

    // --------------------------------------------------
    // Document annotation
    // --------------------------------------------------

    let textElements: any[] = [];

    if (
      data.document_annotation
    ) {
      try {
        /*
         * Depending on the API version,
         * document_annotation may already be
         * an object or may be a JSON string.
         */
        const annotation =
          typeof data.document_annotation ===
          "string"
            ? JSON.parse(
                data.document_annotation
              )
            : data.document_annotation;

        if (
          Array.isArray(
            annotation?.text_elements
          )
        ) {
          textElements =
            annotation.text_elements;
        }
      } catch (error) {
        log(
          "could not parse document annotation",
          {
            error,
            annotation:
              data.document_annotation,
          }
        );
      }
    }

    // --------------------------------------------------
    // Normalize design text boxes
    // --------------------------------------------------

    const normalizedTextElements =
      textElements
        .map(
          (
            element: any,
            index: number
          ) => {
            const bbox =
              Array.isArray(
                element.bbox
              )
                ? element.bbox
                : null;

            if (
              !bbox ||
              bbox.length !== 4
            ) {
              return null;
            }

            const [
              left,
              top,
              right,
              bottom,
            ] = bbox.map(Number);

            if (
              !Number.isFinite(
                left
              ) ||
              !Number.isFinite(
                top
              ) ||
              !Number.isFinite(
                right
              ) ||
              !Number.isFinite(
                bottom
              )
            ) {
              return null;
            }

            if (
              right <= left ||
              bottom <= top
            ) {
              return null;
            }

            return {
              id: `text-${index}`,

              text:
                typeof element.text ===
                "string"
                  ? element.text
                  : "",

              role:
                typeof element.role ===
                "string"
                  ? element.role
                  : "other",

              bbox: {
                topLeftX: left,
                topLeftY: top,
                bottomRightX:
                  right,
                bottomRightY:
                  bottom,
              },
            };
          }
        )
        .filter(Boolean);

    // --------------------------------------------------
    // Debug
    // --------------------------------------------------

    log("OCR result", {
      width:
        page.dimensions?.width,

      height:
        page.dimensions?.height,

      nativeBlockCount:
        blocks.length,

      designTextElementCount:
        normalizedTextElements.length,

      sampleNativeBlock:
        blocks[0] ?? null,

      sampleTextElement:
        normalizedTextElements[0] ??
        null,
    });

    // --------------------------------------------------
    // Return to Next.js
    // --------------------------------------------------

    return NextResponse.json({
      width:
        page.dimensions?.width ?? 0,

      height:
        page.dimensions?.height ?? 0,

      markdown:
        page.markdown ?? "",

      blocks,

      textElements:
        normalizedTextElements,

      /*
       * Keep this during development.
       * It lets us inspect what Mistral actually
       * returned if something goes wrong.
       */
      annotation:
        data.document_annotation ??
        null,
    });
  } catch (error) {
    console.error(
      `${LOG_PREFIX} unexpected error`,
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "OCR request failed",
      },
      { status: 500 }
    );
  }
}
import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

const LOG_PREFIX = "[api/inpaint]";
const MODEL_ID = "fal-ai/qwen-image-edit/inpaint";

function log(message: string, data?: unknown) {
  if (data === undefined) {
    console.log(`${LOG_PREFIX} ${message}`);
    return;
  }
  console.log(`${LOG_PREFIX} ${message}`, data);
}

type InpaintRequestBody = {
  imageDataUrl?: string;
  maskDataUrl?: string;
  prompt?: string;
};

type FalInpaintOutput = {
  images?: Array<{
    url?: string;
    width?: number;
    height?: number;
    content_type?: string;
  }>;
  prompt?: string;
};

export async function POST(req: Request) {
  log("POST request received");

  try {
    if (!process.env.FAL_KEY) {
      log("missing FAL_KEY");
      return NextResponse.json(
        { error: "FAL_KEY is not configured" },
        { status: 500 },
      );
    }

    fal.config({
      credentials: process.env.FAL_KEY,
    });

    const body = (await req.json()) as InpaintRequestBody;
    const { imageDataUrl, maskDataUrl, prompt } = body;

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      log("validation failed: imageDataUrl missing");
      return NextResponse.json(
        { error: "imageDataUrl is required" },
        { status: 400 },
      );
    }

    if (!maskDataUrl || typeof maskDataUrl !== "string") {
      log("validation failed: maskDataUrl missing");
      return NextResponse.json(
        { error: "maskDataUrl is required" },
        { status: 400 },
      );
    }

    if (!prompt || typeof prompt !== "string") {
      log("validation failed: prompt missing");
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 },
      );
    }

    log("calling fal inpaint", {
      model: MODEL_ID,
      promptLength: prompt.length,
      imageDataUrlLength: imageDataUrl.length,
      maskDataUrlLength: maskDataUrl.length,
    });

    const result = await fal.subscribe(MODEL_ID, {
      input: {
        prompt,
        image_url: imageDataUrl,
        mask_url: maskDataUrl,
      },
      logs: true,
      onQueueUpdate: (update) => {
        log("queue update", update);
      },
    });

    const output = result.data as FalInpaintOutput;
    const imageUrl = output.images?.[0]?.url;

    if (!imageUrl) {
      log("fal response missing image URL", output);
      return NextResponse.json(
        { error: "fal.ai did not return an image" },
        { status: 502 },
      );
    }

    log("inpaint success", {
      requestId: result.requestId,
      imageUrl,
      imageCount: output.images?.length ?? 0,
    });

    return NextResponse.json({
      imageUrl,
      images: output.images ?? [],
      requestId: result.requestId,
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} inpaint failed`, error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Inpainting failed",
      },
      { status: 500 },
    );
  }
}

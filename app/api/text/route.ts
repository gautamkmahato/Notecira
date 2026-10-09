import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

const LOG_PREFIX = "[api/text]";
const MODEL_ID = "openai/gpt-image-2/edit";

function log(message: string, data?: unknown) {
  if (data === undefined) {
    console.log(`${LOG_PREFIX} ${message}`);
    return;
  }
  console.log(`${LOG_PREFIX} ${message}`, data);
}

type TextRemoveRequestBody = {
  imageDataUrl?: string;
  prompt?: string;
};

type FalEditOutput = {
  images?: Array<{
    url?: string;
    width?: number;
    height?: number;
    content_type?: string;
  }>;
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

    const body = (await req.json()) as TextRemoveRequestBody;
    const { imageDataUrl, prompt } = body;

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      log("validation failed: imageDataUrl missing");
      return NextResponse.json(
        { error: "imageDataUrl is required" },
        { status: 400 },
      );
    }

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      log("validation failed: prompt missing");
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 },
      );
    }

    log("calling fal text remove", {
      model: MODEL_ID,
      quality: "low",
      promptLength: prompt.trim().length,
      imageDataUrlLength: imageDataUrl.length,
    });

    const result = await fal.subscribe(MODEL_ID, {
      input: {
        prompt: prompt.trim(),
        image_urls: [imageDataUrl],
        quality: "low",
        image_size: "auto",
        num_images: 1,
      },
      logs: true,
      onQueueUpdate: (update) => {
        log("queue update", update);
      },
    });

    const output = result.data as FalEditOutput;
    const imageUrl = output.images?.[0]?.url;

    if (!imageUrl) {
      log("fal response missing image URL", output);
      return NextResponse.json(
        { error: "fal.ai did not return an image" },
        { status: 502 },
      );
    }

    log("text remove success", {
      requestId: result.requestId,
      imageUrl,
    });

    return NextResponse.json({
      imageUrl,
      images: output.images ?? [],
      requestId: result.requestId,
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} text remove failed`, error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Text removal failed",
      },
      { status: 500 },
    );
  }
}

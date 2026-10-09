"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Tab =
  | "original"
  | "mask"
  | "result";

type BBox = {
  topLeftX: number;
  topLeftY: number;
  bottomRightX: number;
  bottomRightY: number;
};

function bboxToRect(bbox: BBox) {
  return {
    x: bbox.topLeftX,
    y: bbox.topLeftY,
    width: bbox.bottomRightX - bbox.topLeftX,
    height: bbox.bottomRightY - bbox.topLeftY,
  };
}

export default function Home() {
  const [imageUrl, setImageUrl] =
    useState<string | null>(null);

  const [maskUrl, setMaskUrl] =
    useState<string | null>(null);

  const [resultUrl, setResultUrl] =
    useState<string | null>(null);

  const [imageSize, setImageSize] =
    useState({
      width: 0,
      height: 0,
    });

  /*
   * BBOX
   *
   * Put the Mistral OCR coordinates here.
   *
   * Example values are only placeholders.
   */
  const [bbox, setBbox] =
    useState<BBox>({
      topLeftX: 135,
      topLeftY: 35,
      bottomRightX: 267,
      bottomRightY: 51,
    });

  const [prompt, setPrompt] =
    useState(
      "Reconstruct the background naturally where the text was removed. Preserve the existing design, lighting, colors, texture, shadows and objects. Do not add any text, letters, logos or symbols."
    );

  const [activeTab, setActiveTab] =
    useState<Tab>("original");

  const [loadingMask, setLoadingMask] =
    useState(false);

  const [loadingInpaint, setLoadingInpaint] =
    useState(false);

  const [error, setError] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  /*
   * ------------------------------------------------
   * IMAGE UPLOAD
   * ------------------------------------------------
   */

  function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setError("");
    setMaskUrl(null);
    setResultUrl(null);

    const url =
      URL.createObjectURL(file);

    setImageUrl(url);

    const img =
      new Image();

    img.onload = () => {
      setImageSize({
        width:
          img.naturalWidth,

        height:
          img.naturalHeight,
      });

      console.log(
        "[magic] image size",
        {
          width:
            img.naturalWidth,
          height:
            img.naturalHeight,
        }
      );
    };

    img.src = url;

    setActiveTab("original");
  }

  /*
   * ------------------------------------------------
   * CREATE MASK
   * ------------------------------------------------
   *
   * White = inpaint
   * Black = preserve
   */

  async function createMask() {
    if (!imageUrl) {
      setError(
        "Upload an image first."
      );
      return;
    }

    setLoadingMask(true);
    setError("");

    try {
      const img =
        await loadImage(
          imageUrl
        );

      /*
       * IMPORTANT:
       *
       * Mask uses the ORIGINAL
       * image dimensions.
       */
      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width =
        img.naturalWidth;

      canvas.height =
        img.naturalHeight;

      const ctx =
        canvas.getContext(
          "2d"
        );

      if (!ctx) {
        throw new Error(
          "Could not create canvas context"
        );
      }

      /*
       * Entire mask starts BLACK.
       *
       * Black = preserve.
       */
      ctx.fillStyle =
        "black";

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      /*
       * BBOX becomes WHITE.
       *
       * White = inpaint.
       */
      ctx.fillStyle =
        "white";

      const rect = bboxToRect(bbox);

      ctx.fillRect(
        rect.x,
        rect.y,
        rect.width,
        rect.height
      );

      const dataUrl =
        canvas.toDataURL(
          "image/png"
        );

      setMaskUrl(
        dataUrl
      );

      setResultUrl(
        null
      );

      setActiveTab(
        "mask"
      );

      console.log(
        "[magic] mask created",
        {
          bbox,
          imageSize,
        }
      );
    } catch (error) {
      console.error(
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create mask"
      );
    } finally {
      setLoadingMask(
        false
      );
    }
  }

  /*
   * ------------------------------------------------
   * INPAINT
   * ------------------------------------------------
   */

  async function runInpaint() {
    if (!imageUrl) {
      setError(
        "Upload an image first."
      );
      return;
    }

    if (!maskUrl) {
      setError(
        "Create the mask first."
      );
      return;
    }

    setLoadingInpaint(
      true
    );

    setError("");

    try {
      /*
       * The original image is currently
       * a browser object URL.
       *
       * Convert it to a data URL so the
       * server can send it directly to fal.
       */
      const imageDataUrl =
        await objectUrlToDataUrl(
          imageUrl
        );

      console.log(
        "[magic] sending to fal",
        {
          bbox,
        }
      );

      const response =
        await fetch(
          "/api/inpaint",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              imageDataUrl,
              maskDataUrl:
                maskUrl,
              prompt,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Inpainting failed"
        );
      }

      console.log(
        "[magic] fal result",
        data
      );

      setResultUrl(
        data.imageUrl
      );

      setActiveTab(
        "result"
      );
    } catch (error) {
      console.error(
        "[magic] inpaint error",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Inpainting failed"
      );
    } finally {
      setLoadingInpaint(
        false
      );
    }
  }

  /*
   * ------------------------------------------------
   * RENDER
   * ------------------------------------------------
   */

  return (
    <main
      style={{
        height: "100vh",
        overflowY: "auto",
        boxSizing: "border-box",
        minHeight:
          "100vh",

        background:
          "#111",

        color:
          "#fff",

        padding:
          "32px",

        fontFamily:
          "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth:
            "1200px",

          margin:
            "0 auto",
        }}
      >
        <h1
          style={{
            margin:
              0,

            fontSize:
              30,
          }}
        >
          Text Removal MVP
        </h1>

        <p
          style={{
            color:
              "#999",

            marginTop:
              8,

            marginBottom:
              30,
          }}
        >
          OCR bbox → mask → fal
          inpainting
        </p>

        {/* ----------------------------------------- */}
        {/* UPLOAD                                    */}
        {/* ----------------------------------------- */}

        <section
          style={panelStyle}
        >
          <h2
            style={
              headingStyle
            }
          >
            1. Input
          </h2>

          <div
            style={{
              display:
                "flex",

              gap:
                12,

              alignItems:
                "center",

              flexWrap:
                "wrap",
            }}
          >
            <button
              onClick={() =>
                fileInputRef.current?.click()
              }
              style={
                primaryButton
              }
            >
              Upload image
            </button>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/*"
              onChange={
                handleUpload
              }
              style={{
                display:
                  "none",
              }}
            />

            {imageSize.width >
              0 && (
              <span
                style={{
                  color:
                    "#888",
                }}
              >
                {imageSize.width} ×{" "}
                {imageSize.height}
              </span>
            )}
          </div>
        </section>

        {/* ----------------------------------------- */}
        {/* BBOX                                      */}
        {/* ----------------------------------------- */}

        {imageUrl && (
          <section
            style={
              panelStyle
            }
          >
            <h2
              style={
                headingStyle
              }
            >
              2. Text bounding box
            </h2>

            <p
              style={{
                color:
                  "#888",

                fontSize:
                  14,

                marginTop:
                  0,
              }}
            >
              Enter the Mistral OCR bbox
              coordinates for the text you
              want to remove.
            </p>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(2, 1fr)",

                gap:
                  10,

                maxWidth:
                  600,
              }}
            >
              <NumberInput
                label="topLeftX"
                value={
                  bbox.topLeftX
                }
                onChange={(
                  value
                ) =>
                  setBbox({
                    ...bbox,
                    topLeftX: value,
                  })
                }
              />

              <NumberInput
                label="topLeftY"
                value={
                  bbox.topLeftY
                }
                onChange={(
                  value
                ) =>
                  setBbox({
                    ...bbox,
                    topLeftY: value,
                  })
                }
              />

              <NumberInput
                label="bottomRightX"
                value={
                  bbox.bottomRightX
                }
                onChange={(
                  value
                ) =>
                  setBbox({
                    ...bbox,
                    bottomRightX:
                      value,
                  })
                }
              />

              <NumberInput
                label="bottomRightY"
                value={
                  bbox.bottomRightY
                }
                onChange={(
                  value
                ) =>
                  setBbox({
                    ...bbox,
                    bottomRightY:
                      value,
                  })
                }
              />
            </div>

            {bbox.bottomRightX > bbox.topLeftX &&
              bbox.bottomRightY > bbox.topLeftY && (
                <p
                  style={{
                    color: "#666",
                    fontSize: 12,
                    marginTop: 12,
                    marginBottom: 0,
                  }}
                >
                  Mask size:{" "}
                  {bbox.bottomRightX - bbox.topLeftX} ×{" "}
                  {bbox.bottomRightY - bbox.topLeftY}
                </p>
              )}

            <div
              style={{
                marginTop:
                  18,

                display:
                  "flex",

                gap:
                  10,
              }}
            >
              <button
                onClick={
                  createMask
                }
                disabled={
                  loadingMask
                }
                style={
                  primaryButton
                }
              >
                {loadingMask
                  ? "Creating..."
                  : "Create mask"}
              </button>
            </div>
          </section>
        )}

        {/* ----------------------------------------- */}
        {/* PROMPT                                    */}
        {/* ----------------------------------------- */}

        {maskUrl && (
          <section
            style={
              panelStyle
            }
          >
            <h2
              style={
                headingStyle
              }
            >
              3. Inpainting prompt
            </h2>

            <textarea
              value={
                prompt
              }
              onChange={(
                event
              ) =>
                setPrompt(
                  event.target
                    .value
                )
              }
              style={{
                width:
                  "100%",

                minHeight:
                  100,

                background:
                  "#0b0b0b",

                border:
                  "1px solid #333",

                color:
                  "#fff",

                borderRadius:
                  8,

                padding:
                  12,

                boxSizing:
                  "border-box",

                resize:
                  "vertical",
              }}
            />

            <button
              onClick={
                runInpaint
              }
              disabled={
                loadingInpaint
              }
              style={{
                ...primaryButton,

                marginTop:
                  12,
              }}
            >
              {loadingInpaint
                ? "Inpainting with fal..."
                : "Send to fal.ai"}
            </button>
          </section>
        )}

        {/* ----------------------------------------- */}
        {/* ERROR                                     */}
        {/* ----------------------------------------- */}

        {error && (
          <div
            style={{
              background:
                "#3a1111",

              border:
                "1px solid #722222",

              color:
                "#ff7777",

              padding:
                14,

              borderRadius:
                8,

              marginBottom:
                20,
            }}
          >
            {error}
          </div>
        )}

        {/* ----------------------------------------- */}
        {/* TABS                                      */}
        {/* ----------------------------------------- */}

        {imageUrl && (
          <section
            style={
              panelStyle
            }
          >
            <div
              style={{
                display:
                  "flex",

                borderBottom:
                  "1px solid #333",

                marginBottom:
                  20,
              }}
            >
              <TabButton
                active={
                  activeTab ===
                  "original"
                }
                onClick={() =>
                  setActiveTab(
                    "original"
                  )
                }
              >
                1. Original
              </TabButton>

              <TabButton
                active={
                  activeTab ===
                  "mask"
                }
                onClick={() =>
                  setActiveTab(
                    "mask"
                  )
                }
                disabled={
                  !maskUrl
                }
              >
                2. Mask
              </TabButton>

              <TabButton
                active={
                  activeTab ===
                  "result"
                }
                onClick={() =>
                  setActiveTab(
                    "result"
                  )
                }
                disabled={
                  !resultUrl
                }
              >
                3. Inpainted
              </TabButton>
            </div>

            {/* ORIGINAL */}

            {activeTab ===
              "original" && (
              <ImagePanel
                src={
                  imageUrl
                }
                label="Original image"
              />
            )}

            {/* MASK */}

            {activeTab ===
              "mask" &&
              maskUrl && (
                <ImagePanel
                  src={
                    maskUrl
                  }
                  label="Generated mask — white = inpaint"
                />
              )}

            {/* RESULT */}

            {activeTab ===
              "result" &&
              resultUrl && (
                <ImagePanel
                  src={
                    resultUrl
                  }
                  label="fal.ai inpaint result"
                />
              )}
          </section>
        )}
      </div>
    </main>
  );
}

/* ================================================= */
/* COMPONENTS                                       */
/* ================================================= */

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <label
      style={{
        display:
          "grid",

        gap:
          6,

        color:
          "#999",

        fontSize:
          12,
      }}
    >
      {label}

      <input
        type="number"
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            Number(
              event.target
                .value
            )
          )
        }
        style={{
          width:
            "100%",

          boxSizing:
            "border-box",

          background:
            "#0b0b0b",

          color:
            "#fff",

          border:
            "1px solid #333",

          borderRadius:
            6,

          padding:
            "9px 10px",
        }}
      />
    </label>
  );
}

function TabButton({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      style={{
        border:
          "none",

        borderBottom:
          active
            ? "2px solid #8b5cf6"
            : "2px solid transparent",

        background:
          "transparent",

        color:
          disabled
            ? "#444"
            : active
            ? "#fff"
            : "#888",

        padding:
          "12px 18px",

        cursor:
          disabled
            ? "not-allowed"
            : "pointer",

        fontWeight:
          active
            ? 600
            : 400,
      }}
    >
      {children}
    </button>
  );
}

function ImagePanel({
  src,
  label,
}: {
  src: string;
  label: string;
}) {
  return (
    <div>
      <div
        style={{
          color:
            "#999",

          fontSize:
            13,

          marginBottom:
            12,
        }}
      >
        {label}
      </div>

      <div
        style={{
          background:
            "#0a0a0a",

          borderRadius:
            8,

          padding:
            20,

          display:
            "flex",

          justifyContent:
            "center",

          overflow:
            "auto",
        }}
      >
        <img
          src={src}
          alt={label}
          style={{
            display:
              "block",

            maxWidth:
              "100%",

            height:
              "auto",
          }}
        />
      </div>
    </div>
  );
}

/* ================================================= */
/* HELPERS                                          */
/* ================================================= */

function loadImage(
  src: string
): Promise<HTMLImageElement> {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const img =
        new Image();

      img.onload = () =>
        resolve(img);

      img.onerror = () =>
        reject(
          new Error(
            "Could not load image"
          )
        );

      img.src = src;
    }
  );
}

async function objectUrlToDataUrl(
  objectUrl: string
): Promise<string> {
  const response =
    await fetch(
      objectUrl
    );

  const blob =
    await response.blob();

  return new Promise(
    (
      resolve,
      reject
    ) => {
      const reader =
        new FileReader();

      reader.onload =
        () =>
          resolve(
            reader.result as string
          );

      reader.onerror =
        () =>
          reject(
            new Error(
              "Could not convert image"
            )
          );

      reader.readAsDataURL(
        blob
      );
    }
  );
}

/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const panelStyle: React.CSSProperties =
  {
    background:
      "#1a1a1a",

    border:
      "1px solid #292929",

    borderRadius:
      12,

    padding:
      20,

    marginBottom:
      20,
  };

const headingStyle: React.CSSProperties =
  {
    margin:
      "0 0 16px",

    fontSize:
      17,
  };

const primaryButton: React.CSSProperties =
  {
    border:
      "none",

    borderRadius:
      7,

    padding:
      "11px 17px",

    background:
      "#7c3aed",

    color:
      "#fff",

    fontWeight:
      600,

    cursor:
      "pointer",
  };
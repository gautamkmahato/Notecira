"use client";

import { useEffect, useRef, useState } from "react";

const LOG_PREFIX = "[magic/page]";

type BBox = {
  topLeftX: number;
  topLeftY: number;
  bottomRightX: number;
  bottomRightY: number;
};

type OCRBlock = {
  label?: string;
  text?: string;
  bbox: BBox;
  confidence?: unknown;
};

type TextElement = {
  id: string;
  text: string;
  role: string;
  bbox: BBox;
};

function log(
  message: string,
  data?: unknown
) {
  if (data === undefined) {
    console.log(
      `${LOG_PREFIX} ${message}`
    );
    return;
  }

  console.log(
    `${LOG_PREFIX} ${message}`,
    data
  );
}

function normalizeBBox(
  raw: unknown
): BBox | null {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return null;
  }

  const bbox =
    raw as Record<
      string,
      unknown
    >;

  /*
   * Our API already normalizes these,
   * but keep this tolerant.
   */

  if (
    typeof bbox.topLeftX ===
      "number" &&
    typeof bbox.topLeftY ===
      "number" &&
    typeof bbox.bottomRightX ===
      "number" &&
    typeof bbox.bottomRightY ===
      "number"
  ) {
    return {
      topLeftX: bbox.topLeftX,
      topLeftY: bbox.topLeftY,
      bottomRightX:
        bbox.bottomRightX,
      bottomRightY:
        bbox.bottomRightY,
    };
  }

  return null;
}

function normalizeBlocks(
  rawBlocks: unknown
): OCRBlock[] {
  if (!Array.isArray(rawBlocks)) {
    return [];
  }

  return rawBlocks
    .map((block) => {
      if (
        !block ||
        typeof block !==
          "object"
      ) {
        return null;
      }

      const entry =
        block as Record<
          string,
          unknown
        >;

      const bbox =
        normalizeBBox(
          entry.bbox
        );

      if (!bbox) {
        return null;
      }

      return {
        label:
          typeof entry.label ===
          "string"
            ? entry.label
            : undefined,

        text:
          typeof entry.text ===
          "string"
            ? entry.text
            : undefined,

        bbox,

        confidence:
          entry.confidence ??
          null,
      };
    })
    .filter(
      Boolean
    ) as OCRBlock[];
}

function normalizeTextElements(
  rawElements: unknown
): TextElement[] {
  if (
    !Array.isArray(
      rawElements
    )
  ) {
    return [];
  }

  return rawElements
    .map((element, index) => {
      if (
        !element ||
        typeof element !==
          "object"
      ) {
        return null;
      }

      const entry =
        element as Record<
          string,
          unknown
        >;

      const bbox =
        normalizeBBox(
          entry.bbox
        );

      if (!bbox) {
        return null;
      }

      return {
        id:
          typeof entry.id ===
          "string"
            ? entry.id
            : `text-${index}`,

        text:
          typeof entry.text ===
          "string"
            ? entry.text
            : "",

        role:
          typeof entry.role ===
          "string"
            ? entry.role
            : "other",

        bbox,
      };
    })
    .filter(
      Boolean
    ) as TextElement[];
}

export default function Home() {
  const [imageUrl, setImageUrl] =
    useState<string | null>(
      null
    );

  const [imageSize, setImageSize] =
    useState({
      width: 0,
      height: 0,
    });

  const [blocks, setBlocks] =
    useState<OCRBlock[]>(
      []
    );

  const [
    textElements,
    setTextElements,
  ] = useState<
    TextElement[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [status, setStatus] =
    useState("");

  const imageUrlRef =
    useRef<string | null>(
      null
    );

  useEffect(() => {
    log("mounted");

    return () => {
      if (
        imageUrlRef.current
      ) {
        URL.revokeObjectURL(
          imageUrlRef.current
        );
      }
    };
  }, []);

  function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      imageUrlRef.current
    ) {
      URL.revokeObjectURL(
        imageUrlRef.current
      );
    }

    const url =
      URL.createObjectURL(
        file
      );

    imageUrlRef.current =
      url;

    setImageUrl(url);
    setBlocks([]);
    setTextElements([]);
    setError("");
    setStatus("");

    setImageSize({
      width: 0,
      height: 0,
    });

    log(
      "image selected",
      {
        name: file.name,
        type: file.type,
        sizeBytes:
          file.size,
      }
    );

    const img =
      new Image();

    img.onload = () => {
      const size = {
        width:
          img.naturalWidth,

        height:
          img.naturalHeight,
      };

      setImageSize(size);

      log(
        "image loaded",
        size
      );
    };

    img.onerror = () => {
      setError(
        "Failed to load image."
      );
    };

    img.src = url;
  }

  async function detectText() {
    if (!imageUrl) {
      return;
    }

    setLoading(true);
    setError("");
    setBlocks([]);
    setTextElements([]);

    setStatus(
      "Analyzing design with Mistral OCR 4.1..."
    );

    try {
      /*
       * Convert browser object URL
       * into a File.
       */

      const imageResponse =
        await fetch(
          imageUrl
        );

      const blob =
        await imageResponse.blob();

      const file =
        new File(
          [blob],
          "design.png",
          {
            type:
              blob.type ||
              "image/png",
          }
        );

      const formData =
        new FormData();

      formData.append(
        "image",
        file
      );

      const response =
        await fetch(
          "/api/ocr",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "OCR failed"
        );
      }

      log(
        "API response",
        {
          nativeBlocks:
            data.blocks
              ?.length ?? 0,

          textElements:
            data.textElements
              ?.length ?? 0,
        }
      );

      const normalizedBlocks =
        normalizeBlocks(
          data.blocks
        );

      const normalizedTextElements =
        normalizeTextElements(
          data.textElements
        );

      setBlocks(
        normalizedBlocks
      );

      setTextElements(
        normalizedTextElements
      );

      if (
        data.width &&
        data.height
      ) {
        setImageSize({
          width: data.width,
          height: data.height,
        });
      }

      setStatus(
        `OCR blocks: ${normalizedBlocks.length} · Design text: ${normalizedTextElements.length}`
      );

      log(
        "normalized result",
        {
          blocks:
            normalizedBlocks,

          textElements:
            normalizedTextElements,
        }
      );
    } catch (error) {
      console.error(
        `${LOG_PREFIX} OCR failed`,
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "OCR failed"
      );

      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  /*
   * Convert original image coordinates
   * to percentages.
   */
  function getBoxStyle(
    bbox: BBox
  ) {
    const scaleX =
      100 /
      imageSize.width;

    const scaleY =
      100 /
      imageSize.height;

    const left =
      bbox.topLeftX *
      scaleX;

    const top =
      bbox.topLeftY *
      scaleY;

    const width =
      (bbox.bottomRightX -
        bbox.topLeftX) *
      scaleX;

    const height =
      (bbox.bottomRightY -
        bbox.topLeftY) *
      scaleY;

    return {
      left: `${left}%`,
      top: `${top}%`,
      width: `${width}%`,
      height: `${height}%`,
    };
  }

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

        color: "#fff",

        padding: 40,

        fontFamily:
          "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin:
            "0 auto",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 32,
          }}
        >
          Magic Text
        </h1>

        <p
          style={{
            color: "#999",
            marginTop: 8,
            marginBottom: 30,
          }}
        >
          Mistral OCR 4.1
          design-text detection
        </p>

        {/* CONTROLS */}

        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: 12,
            marginBottom: 25,
          }}
        >
          <label
            style={{
              background:
                "#fff",

              color:
                "#111",

              padding:
                "12px 18px",

              borderRadius: 8,

              cursor:
                "pointer",

              fontWeight:
                600,
            }}
          >
            Choose image

            <input
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
          </label>

          <button
            onClick={
              detectText
            }
            disabled={
              !imageUrl ||
              loading
            }
            style={{
              border: 0,

              borderRadius:
                8,

              padding:
                "12px 20px",

              background:
                !imageUrl ||
                loading
                  ? "#444"
                  : "#7c3aed",

              color:
                "#fff",

              fontWeight:
                600,

              cursor:
                !imageUrl ||
                loading
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading
              ? "Analyzing..."
              : "Detect text"}
          </button>

          <span
            style={{
              color:
                "#999",

              fontSize:
                14,
            }}
          >
            {status}
          </span>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              background:
                "#3a1111",

              border:
                "1px solid #6b2222",

              padding: 15,

              borderRadius:
                8,

              color:
                "#ff7777",

              marginBottom:
                20,
            }}
          >
            {error}
          </div>
        )}

        {/* LEGEND */}

        {imageUrl && (
          <div
            style={{
              display:
                "flex",

              gap: 20,

              marginBottom:
                15,

              fontSize:
                13,

              color:
                "#aaa",
            }}
          >
            <span>
              <span
                style={{
                  display:
                    "inline-block",

                  width: 12,
                  height: 12,

                  border:
                    "2px solid #00ff88",

                  marginRight:
                    6,
                }}
              />

              Native OCR
              blocks
            </span>

            <span>
              <span
                style={{
                  display:
                    "inline-block",

                  width: 12,
                  height: 12,

                  border:
                    "2px solid #a855f7",

                  marginRight:
                    6,
                }}
              />

              Design text
              elements
            </span>
          </div>
        )}

        {/* IMAGE */}

        {imageUrl &&
          imageSize.width >
            0 && (
            <div
              style={{
                background:
                  "#222",

                padding: 20,

                borderRadius:
                  12,

                overflow:
                  "auto",
              }}
            >
              <div
                style={{
                  position:
                    "relative",

                  width:
                    "min(100%, 1000px)",

                  margin:
                    "0 auto",
                }}
              >
                <img
                  src={
                    imageUrl
                  }
                  alt="Uploaded design"
                  style={{
                    display:
                      "block",

                    width:
                      "100%",

                    height:
                      "auto",
                  }}
                />

                {/* -------------------------------- */}
                {/* NATIVE OCR BLOCKS - GREEN       */}
                {/* -------------------------------- */}

                {blocks.map(
                  (
                    block,
                    index
                  ) => {
                    const style =
                      getBoxStyle(
                        block.bbox
                      );

                    return (
                      <div
                        key={`ocr-${index}`}
                        title={
                          block.text ||
                          ""
                        }
                        style={{
                          position:
                            "absolute",

                          ...style,

                          padding:
                            0,

                          margin:
                            0,

                          boxSizing:
                            "border-box",

                          border:
                            "1px solid #00ff88",

                          borderRadius:
                            3,

                          pointerEvents:
                            "none",

                          background:
                            "rgba(0,255,136,0.02)",
                        }}
                      />
                    );
                  }
                )}

                {/* -------------------------------- */}
                {/* DESIGN TEXT ELEMENTS - PURPLE   */}
                {/* -------------------------------- */}

                {textElements.map(
                  (
                    element
                  ) => {
                    const style =
                      getBoxStyle(
                        element.bbox
                      );

                    return (
                      <div
                        key={
                          element.id
                        }
                        title={`${element.role}: ${element.text}`}
                        style={{
                          position:
                            "absolute",

                          ...style,

                          padding:
                            0,

                          margin:
                            0,

                          boxSizing:
                            "border-box",

                          border:
                            "2px solid #a855f7",

                          borderRadius:
                            5,

                          pointerEvents:
                            "none",

                          background:
                            "rgba(168,85,247,0.04)",
                        }}
                      >
                        <span
                          style={{
                            position:
                              "absolute",

                            top:
                              -20,

                            left: 0,

                            background:
                              "#a855f7",

                            color:
                              "#fff",

                            fontSize:
                              10,

                            lineHeight:
                              "16px",

                            padding:
                              "0 4px",

                            borderRadius:
                              "3px 3px 0 0",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {
                            element.role
                          }
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

        {/* -------------------------------- */}
        {/* DESIGN TEXT RESULTS              */}
        {/* -------------------------------- */}

        {textElements.length >
          0 && (
          <section
            style={{
              marginTop:
                30,

              background:
                "#1c1c1c",

              borderRadius:
                12,

              padding: 20,
            }}
          >
            <h2
              style={{
                marginTop:
                  0,

                fontSize:
                  18,
              }}
            >
              Design text
              elements
            </h2>

            <div
              style={{
                display:
                  "grid",

                gap: 8,
              }}
            >
              {textElements.map(
                (
                  element,
                  index
                ) => (
                  <div
                    key={
                      element.id
                    }
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        "40px 110px 1fr",

                      gap: 15,

                      padding:
                        "10px 0",

                      borderBottom:
                        "1px solid #333",
                    }}
                  >
                    <span
                      style={{
                        color:
                          "#666",
                      }}
                    >
                      {index +
                        1}
                    </span>

                    <span
                      style={{
                        color:
                          "#a855f7",

                        fontSize:
                          13,
                      }}
                    >
                      {
                        element.role
                      }
                    </span>

                    <span>
                      {
                        element.text
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* -------------------------------- */}
        {/* NATIVE OCR RESULTS               */}
        {/* -------------------------------- */}

        {blocks.length >
          0 && (
          <section
            style={{
              marginTop:
                20,

              background:
                "#181818",

              borderRadius:
                12,

              padding: 20,
            }}
          >
            <h2
              style={{
                marginTop:
                  0,

                fontSize:
                  18,
              }}
            >
              Native OCR
              blocks
            </h2>

            <div
              style={{
                display:
                  "grid",

                gap: 6,
              }}
            >
              {blocks.map(
                (
                  block,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    style={{
                      padding:
                        "12px 0",

                      borderBottom:
                        "1px solid #2c2c2c",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "grid",

                        gridTemplateColumns:
                          "40px 100px 1fr",

                        gap: 15,

                        marginBottom:
                          10,
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#555",
                        }}
                      >
                        {index +
                          1}
                      </span>

                      <span
                        style={{
                          color:
                            "#00ff88",

                          fontSize:
                            12,
                        }}
                      >
                        {
                          block.label ||
                          "text"
                        }
                      </span>

                      <span>
                        {
                          block.text
                        }
                      </span>
                    </div>

                    <div
                      style={{
                        display:
                          "grid",

                        gap: 6,

                        marginLeft:
                          55,

                        fontSize:
                          12,

                        color:
                          "#999",
                      }}
                    >
                      {Object.entries(
                        block
                      )
                        .filter(
                          ([
                            key,
                          ]) =>
                            key !==
                              "label" &&
                            key !==
                              "text"
                        )
                        .map(
                        ([
                          key,
                          value,
                        ]) => (
                          <div
                            key={
                              key
                            }
                            style={{
                              display:
                                "grid",

                              gridTemplateColumns:
                                "110px 1fr",

                              gap: 12,

                              alignItems:
                                "start",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  "#666",

                                textTransform:
                                  "lowercase",
                              }}
                            >
                              {
                                key
                              }
                            </span>

                            <span
                              style={{
                                fontFamily:
                                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",

                                fontSize:
                                  11,

                                color:
                                  "#bbb",

                                whiteSpace:
                                  "pre-wrap",

                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {value ===
                                undefined ||
                              value ===
                                null
                                ? "—"
                                : typeof value ===
                                    "object"
                                  ? JSON.stringify(
                                      value,
                                      null,
                                      2
                                    )
                                  : String(
                                      value
                                    )}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";

const LOG_PREFIX = "[text/page]";

const DEFAULT_PROMPT =
  "Remove all text from this image. Keep everything else exactly as it is: backgrounds, images, icons, logos, colors, layout, lighting, and design elements. Do not add any new text, letters, words, or symbols.";

type Tab = "original" | "result";

function log(message: string, data?: unknown) {
  if (data === undefined) {
    console.log(`${LOG_PREFIX} ${message}`);
    return;
  }
  console.log(`${LOG_PREFIX} ${message}`, data);
}

async function objectUrlToDataUrl(objectUrl: string): Promise<string> {
  const response = await fetch(objectUrl);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(blob);
  });
}

export default function TextRemovePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [activeTab, setActiveTab] = useState<Tab>("original");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
    };
  }, []);

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = null;
    }

    const url = URL.createObjectURL(file);
    imageUrlRef.current = url;

    setImageUrl(url);
    setResultUrl(null);
    setError("");
    setStatus("");
    setActiveTab("original");

    log("image uploaded", {
      name: file.name,
      type: file.type,
      sizeBytes: file.size,
    });
  }

  async function runTextRemove() {
    if (!imageUrl) {
      setError("Upload an image first.");
      return;
    }

    if (!prompt.trim()) {
      setError("Prompt cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Sending image to fal.ai...");

    try {
      const imageDataUrl = await objectUrlToDataUrl(imageUrl);

      log("calling /api/text", {
        promptLength: prompt.trim().length,
      });

      const response = await fetch("/api/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageDataUrl,
          prompt: prompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Text removal failed");
      }

      if (!data.imageUrl || typeof data.imageUrl !== "string") {
        throw new Error("API did not return a result image");
      }

      setResultUrl(data.imageUrl);
      setActiveTab("result");
      setStatus("Done");

      log("text remove success", {
        imageUrl: data.imageUrl,
      });
    } catch (err) {
      console.error(`${LOG_PREFIX} failed`, err);
      setError(err instanceof Error ? err.message : "Text removal failed");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        height: "100vh",
        overflowY: "auto",
        boxSizing: "border-box",
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        padding: 32,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 30 }}>Text Removal</h1>
        <p style={{ color: "#999", marginTop: 8, marginBottom: 24 }}>
          GPT Image 2 edit — remove text while keeping the rest of the design
        </p>

        <section style={panelStyle}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={primaryButton}
          >
            Upload image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: "none" }}
          />
        </section>

        <section style={panelStyle}>
          <h2 style={headingStyle}>Prompt</h2>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            style={{
              width: "100%",
              minHeight: 120,
              boxSizing: "border-box",
              background: "#0b0b0b",
              border: "1px solid #333",
              color: "#fff",
              borderRadius: 8,
              padding: 12,
              resize: "vertical",
            }}
          />
          <button
            type="button"
            onClick={runTextRemove}
            disabled={!imageUrl || loading || !prompt.trim()}
            style={{
              ...primaryButton,
              marginTop: 12,
              opacity: !imageUrl || loading || !prompt.trim() ? 0.5 : 1,
              cursor:
                !imageUrl || loading || !prompt.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading ? "Processing..." : "Remove text"}
          </button>
          {status ? (
            <p style={{ color: "#888", fontSize: 14, marginTop: 10 }}>{status}</p>
          ) : null}
        </section>

        {error ? (
          <div
            style={{
              background: "#3a1111",
              border: "1px solid #722222",
              color: "#ff7777",
              padding: 14,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        ) : null}

        {imageUrl ? (
          <section style={panelStyle}>
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #333",
                marginBottom: 20,
              }}
            >
              <TabButton
                active={activeTab === "original"}
                onClick={() => setActiveTab("original")}
              >
                Original
              </TabButton>
              <TabButton
                active={activeTab === "result"}
                onClick={() => setActiveTab("result")}
                disabled={!resultUrl}
              >
                Result
              </TabButton>
            </div>

            {activeTab === "original" ? (
              <ImagePanel src={imageUrl} label="Uploaded image" />
            ) : resultUrl ? (
              <ImagePanel src={resultUrl} label="Text removed" />
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
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
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "none",
        borderBottom: active ? "2px solid #8b5cf6" : "2px solid transparent",
        background: "transparent",
        color: disabled ? "#444" : active ? "#fff" : "#888",
        padding: "12px 18px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

function ImagePanel({ src, label }: { src: string; label: string }) {
  return (
    <div>
      <div style={{ color: "#999", fontSize: 13, marginBottom: 12 }}>{label}</div>
      <div
        style={{
          background: "#0a0a0a",
          borderRadius: 8,
          padding: 20,
          display: "flex",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        <img
          src={src}
          alt={label}
          style={{ display: "block", maxWidth: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: "#1a1a1a",
  border: "1px solid #292929",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
};

const headingStyle: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: 17,
};

const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: 7,
  padding: "11px 17px",
  background: "#7c3aed",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

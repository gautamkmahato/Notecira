"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Link2, X } from "lucide-react";
import type {
  DocumentShareSettings,
  ShareVisibility,
} from "@/lib/domain/sharing";

type ShareDocumentModalProps = {
  documentId: string;
  documentTitle: string;
  open: boolean;
  onClose: () => void;
};

const VISIBILITY_OPTIONS: {
  value: ShareVisibility;
  label: string;
  description: string;
}[] = [
  {
    value: "private",
    label: "Private",
    description: "Only you can access this document",
  },
  {
    value: "public",
    label: "Public",
    description: "Anyone with the link can view",
  },
  {
    value: "restricted",
    label: "Specific people",
    description: "Only invited emails can view (must sign in)",
  },
];

export function ShareDocumentModal({
  documentId,
  documentTitle,
  open,
  onClose,
}: ShareDocumentModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState<ShareVisibility>("private");
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError(null);
    void fetch(`/api/documents/${documentId}/share`, {
      credentials: "include",
    })
      .then(async (res) => {
        const body = (await res.json()) as DocumentShareSettings & {
          error?: string;
        };
        if (!res.ok) throw new Error(body.error ?? "Failed to load sharing");
        setVisibility(body.visibility);
        setAllowedEmails(body.allowedEmails ?? []);
        setShareUrl(body.shareUrl);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, documentId]);

  if (!open || !mounted) return null;

  const showLink = visibility !== "private" && shareUrl;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility, allowedEmails }),
      });
      const body = (await res.json()) as DocumentShareSettings & {
        error?: string;
      };
      if (!res.ok) throw new Error(body.error ?? "Failed to save sharing");
      setVisibility(body.visibility);
      setAllowedEmails(body.allowedEmails ?? []);
      setShareUrl(body.shareUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function addEmail() {
    const email = emailInput.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (!allowedEmails.includes(email)) {
      setAllowedEmails((prev) => [...prev, email]);
    }
    setEmailInput("");
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-15)] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close share dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        className="relative w-full max-w-md rounded-[var(--radius-2xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-md)]"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2
              id="share-dialog-title"
              className="text-[var(--font-size-lg)] font-semibold text-[var(--color-dark-gray-2)]"
            >
              Share document
            </h2>
            <p className="mt-1 truncate text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
              {documentTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="notion-icon-btn"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
            Loading…
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer gap-3 rounded-[var(--radius-xl)] border px-3 py-3 transition ${
                    visibility === option.value
                      ? "border-[var(--color-blue)] bg-[var(--color-blue-5)]"
                      : "border-[var(--color-light-gray-2)] hover:bg-[var(--notion-hover)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={() => setVisibility(option.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)]">
                      {option.label}
                    </span>
                    <span className="block text-[var(--font-size-2xs)] text-[var(--color-mid-gray)]">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {visibility === "restricted" ? (
              <div>
                <label className="mb-2 block text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)]">
                  Invited emails
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEmail();
                      }
                    }}
                    placeholder="name@example.com"
                    className="min-w-0 flex-1 rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] px-3 py-2 text-[var(--font-size-sm)] outline-none focus:border-[var(--color-blue)]"
                  />
                  <button
                    type="button"
                    onClick={addEmail}
                    className="notion-btn"
                  >
                    Add
                  </button>
                </div>
                {allowedEmails.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {allowedEmails.map((email) => (
                      <li
                        key={email}
                        className="flex items-center justify-between rounded-[var(--radius-lg)] bg-[var(--color-white-2)] px-3 py-1.5 text-[var(--font-size-sm)]"
                      >
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAllowedEmails((prev) =>
                              prev.filter((e) => e !== email),
                            )
                          }
                          className="text-[var(--color-mid-gray)] hover:text-[var(--color-dark-gray-2)]"
                          aria-label={`Remove ${email}`}
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {showLink ? (
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white-2)] p-3">
                <div className="mb-2 flex items-center gap-2 text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)]">
                  <Link2 size={16} />
                  Share link
                </div>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareUrl ?? ""}
                    className="min-w-0 flex-1 truncate rounded-[var(--radius-lg)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-3 py-2 text-[var(--font-size-sm)]"
                  />
                  <button
                    type="button"
                    onClick={() => void copyLink()}
                    className="notion-btn inline-flex items-center gap-1"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="text-[var(--font-size-sm)] text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="notion-btn">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="notion-btn notion-btn-primary"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

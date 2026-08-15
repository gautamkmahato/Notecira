"use client";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/signout", {
          method: "POST",
          credentials: "include",
        });
        window.location.assign("/sign-in");
      }}
      className="rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-4 py-2 text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--notion-hover)]"
    >
      Sign out
    </button>
  );
}

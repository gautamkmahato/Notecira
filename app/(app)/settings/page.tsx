import { SignOutButton } from "@/components/SignOutButton";

export default function SettingsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="bg-[var(--color-white)] px-6 py-5 shadow-[var(--shadow-lg)]">
        <h1 className="text-[var(--font-size-xl)] font-medium tracking-tight text-[var(--color-dark-gray-2)]">
          Settings
        </h1>
      </header>
      <div className="p-6">
        <section className="max-w-md rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] p-5 shadow-[var(--shadow-sm)]">
          <h2 className="text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)]">
            Account
          </h2>
          <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
            Sign out of your account on this device.
          </p>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </section>
      </div>
    </div>
  );
}

import Link from "next/link";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  oauth: "Sign-in was cancelled or failed. Please try again.",
  oauth_start: "Could not start sign-in. Check OAuth provider configuration.",
  missing_code: "Missing authorization code. Please try again.",
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const errorMessage = params.error
    ? (ERROR_MESSAGES[params.error] ?? "Sign-in failed. Please try again.")
    : null;

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-[var(--color-white-2)] px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-2xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] p-8 shadow-[var(--shadow-md)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-dark-gray-2)] text-[var(--font-size-lg)] font-medium text-[var(--color-white)]">
            B
          </div>
          <h1 className="text-[var(--font-size-xl)] font-semibold text-[var(--color-dark-gray-2)]">
            Welcome to Branch
          </h1>
          <p className="mt-2 text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
            Sign in to access your documents
          </p>
        </div>

        {errorMessage ? (
          <p
            className="mb-4 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 px-3 py-2 text-[var(--font-size-sm)] text-red-700"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <Link
            href="/api/auth/oauth/google"
            className="flex h-11 items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--notion-hover)]"
          >
            Continue with Google
          </Link>
          <Link
            href="/api/auth/oauth/github"
            className="flex h-11 items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--notion-hover)]"
          >
            Continue with GitHub
          </Link>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Branch — nested writing",
  description:
    "A simple writing app where any block can open a sub-document beside it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex h-full min-h-full flex-col overflow-hidden bg-[var(--color-white)] text-[var(--color-dark-gray-2)]">
        {children}
      </body>
    </html>
  );
}

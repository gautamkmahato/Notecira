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


<div className="flex w-full items-center mb-16">
                    <div className="flex max-w-[720px] flex-col">
                        <h3 className="text-[32px] font-normal leading-[38.4px] text-white">
                            Everything an AI agent needs to execute.
                            <br />
                            <span className="text-[#a2a2a2]">
                                Secure sandboxes with browsers, terminals, files, runtimes, and network access.
                            </span>
                        </h3>
                    </div>
                </div>
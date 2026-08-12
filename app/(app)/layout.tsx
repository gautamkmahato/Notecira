import { MainNav } from "@/components/MainNav";
import { DocumentStoreProvider } from "@/lib/document-store";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DocumentStoreProvider>
      <div className="flex min-h-0 flex-1">
        <MainNav />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </DocumentStoreProvider>
  );
}

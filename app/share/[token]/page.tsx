import { SharePageClient } from "@/components/SharePageClient";

type SharePageProps = {
  params: Promise<{ token: string }>;
};

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  return <SharePageClient token={token} />;
}

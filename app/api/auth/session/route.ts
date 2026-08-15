import { withAuth } from "@/lib/api/with-auth";
import { jsonOk } from "@/lib/api/responses";
import { getInsforgeFromRequest } from "@/lib/insforge/server";

export const GET = withAuth(async (request, auth) => {
  const insforge = await getInsforgeFromRequest(request, auth.accessToken);
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user) {
    return jsonOk({
      user: {
        id: auth.userId,
        email: auth.email,
        name: null,
        avatarUrl: null,
        providers: [],
        emailVerified: false,
        createdAt: null,
      },
    });
  }

  const user = data.user;
  const profile = user.profile as { name?: string; avatar_url?: string } | null;

  return jsonOk({
    user: {
      id: user.id,
      email: user.email ?? auth.email,
      name: profile?.name?.trim() || null,
      avatarUrl: profile?.avatar_url?.trim() || null,
      providers: user.providers ?? [],
      emailVerified: Boolean(user.emailVerified),
      createdAt: user.createdAt ?? null,
    },
  });
});

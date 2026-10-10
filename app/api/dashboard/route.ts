import { getCachedDashboardSummary } from "@/lib/cache/dashboard";
import { normalizeDashboardSummary } from "@/lib/dashboard/normalize-summary";
import { withAuth } from "@/lib/api/with-auth";
import { jsonOk } from "@/lib/api/responses";

export const GET = withAuth(async (_request, auth) => {
  const summary = normalizeDashboardSummary(
    await getCachedDashboardSummary(auth.userId, auth.accessToken),
  );

  return jsonOk(summary, 200, {
    "Cache-Control": "private, max-age=0, must-revalidate",
  });
});

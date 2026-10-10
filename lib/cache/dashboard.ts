import { revalidateTag, unstable_cache } from "next/cache";
import { fetchDashboardSummary } from "@/lib/data/dashboard-db";
import type { DashboardSummary } from "@/lib/domain/dashboard";

export function dashboardCacheTag(userId: string): string {
  return `dashboard:${userId}`;
}

export function invalidateDashboardCache(userId: string): void {
  revalidateTag(dashboardCacheTag(userId), "max");
}

const DASHBOARD_REVALIDATE_SECONDS = 30;

export async function getCachedDashboardSummary(
  userId: string,
  accessToken: string,
): Promise<DashboardSummary> {
  return unstable_cache(
    () => fetchDashboardSummary(accessToken, userId),
    ["dashboard-summary", "v2", userId],
    {
      tags: [dashboardCacheTag(userId)],
      revalidate: DASHBOARD_REVALIDATE_SECONDS,
    },
  )();
}

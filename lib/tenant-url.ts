import "server-only";

import { headers } from "next/headers";

import { leagueSlugFromHostname } from "@/lib/public-url";

type TenantSearchValue = string | number | boolean | null | undefined;
type TenantSearchParams =
  | URLSearchParams
  | Record<string, TenantSearchValue>;

export type TenantUrlBuilder = (
  pathname?: string,
  searchParams?: TenantSearchParams,
) => string;

function queryString(searchParams?: TenantSearchParams) {
  if (!searchParams) {
    return "";
  }

  if (searchParams instanceof URLSearchParams) {
    const value = searchParams.toString();
    return value ? `?${value}` : "";
  }

  const value = new URLSearchParams();
  for (const [key, entry] of Object.entries(searchParams)) {
    if (entry !== null && entry !== undefined && entry !== "") {
      value.set(key, String(entry));
    }
  }

  const serialized = value.toString();
  return serialized ? `?${serialized}` : "";
}

export async function getTenantUrlBuilder(
  leagueSlug: string,
  requestHostname?: string,
): Promise<TenantUrlBuilder> {
  const requestHeaders = requestHostname ? null : await headers();
  const hostname = (
    requestHostname ||
    requestHeaders?.get("host") ||
    requestHeaders?.get("x-forwarded-host") ||
    ""
  )
    .split(",")[0]
    .trim();
  const isTenantHostname = leagueSlugFromHostname(hostname) === leagueSlug;
  const tenantRoot = isTenantHostname ? "" : `/leagues/${leagueSlug}`;

  return (pathname = "/", searchParams) => {
    const normalizedPath = `/${pathname}`.replace(/\/{2,}/g, "/");
    const tenantPath =
      normalizedPath === "/" ? tenantRoot || "/" : `${tenantRoot}${normalizedPath}`;

    return `${tenantPath}${queryString(searchParams)}`;
  };
}

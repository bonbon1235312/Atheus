import { type NextRequest, NextResponse } from "next/server";

import {
  atheusRootDomain,
  RESERVED_LEAGUE_SLUGS,
} from "@/lib/public-url";

const PUBLIC_FILE = /\.[a-z0-9]+$/i;

function leagueSlugFromHostname(hostname: string) {
  const rootDomain = atheusRootDomain();
  const normalized = hostname.toLowerCase().split(":")[0];
  const suffix = `.${rootDomain}`;

  if (!normalized.endsWith(suffix)) {
    return null;
  }

  const slug = normalized.slice(0, -suffix.length);
  if (
    !slug ||
    slug.includes(".") ||
    RESERVED_LEAGUE_SLUGS.has(slug) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    return null;
  }

  return slug;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHostname =
    request.headers.get("host") ||
    request.headers.get("x-forwarded-host") ||
    request.nextUrl.hostname;
  const normalizedHostname = requestHostname.split(":")[0].toLowerCase();
  const slug = leagueSlugFromHostname(normalizedHostname);

  if (slug) {
    const internalRoot = `/leagues/${slug}`;

    if (pathname.startsWith("/admin")) {
      const legacyAdminMatch = pathname.match(
        /^\/admin\/[0-9a-f-]{36}(\/.*)?$/i,
      );
      if (legacyAdminMatch) {
        const destination = request.nextUrl.clone();
        destination.pathname = `/admin${legacyAdminMatch[1] ?? ""}`;
        return NextResponse.redirect(destination);
      }

      const destination = request.nextUrl.clone();
      destination.pathname = `/tenant/${slug}${pathname}`;
      return NextResponse.rewrite(destination);
    }

    if (pathname === internalRoot || pathname.startsWith(`${internalRoot}/`)) {
      const destination = request.nextUrl.clone();
      destination.pathname = pathname.slice(internalRoot.length) || "/";
      return NextResponse.redirect(destination);
    }

    if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      PUBLIC_FILE.test(pathname)
    ) {
      return NextResponse.next();
    }

    const destination = request.nextUrl.clone();
    destination.pathname =
      pathname === "/" ? internalRoot : `${internalRoot}${pathname}`;
    return NextResponse.rewrite(destination);
  }

  if (
    normalizedHostname === atheusRootDomain() ||
    normalizedHostname === `www.${atheusRootDomain()}`
  ) {
    const centralLeagueAdminMatch = pathname.match(
      /^\/admin\/[0-9a-f-]{36}(?:\/([^/]+))?/i,
    );
    if (
      centralLeagueAdminMatch &&
      centralLeagueAdminMatch[1] !== "site-access"
    ) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/admin";
      destination.search = "";
      return NextResponse.redirect(destination);
    }
  }

  const publicLeagueMatch = pathname.match(
    /^\/leagues\/([a-z0-9]+(?:-[a-z0-9]+)*)(\/.*)?$/,
  );
  if (
    publicLeagueMatch &&
    (normalizedHostname === atheusRootDomain() ||
      normalizedHostname === `www.${atheusRootDomain()}`)
  ) {
    const [, publicSlug, suffix = ""] = publicLeagueMatch;
    const destination = request.nextUrl.clone();
    destination.hostname = `${publicSlug}.${atheusRootDomain()}`;
    destination.pathname = suffix || "/";
    return NextResponse.redirect(destination);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

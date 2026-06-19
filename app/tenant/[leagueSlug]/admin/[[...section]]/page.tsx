import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import CollectorPage from "@/app/admin/[leagueId]/collector/page";
import DivisionsPage from "@/app/admin/[leagueId]/divisions/page";
import FixturesAdminPage from "@/app/admin/[leagueId]/fixtures/page";
import ImportsPage from "@/app/admin/[leagueId]/imports/page";
import LeagueWorkspacePage from "@/app/admin/[leagueId]/page";
import PlayerIdentitiesPage from "@/app/admin/[leagueId]/players/page";
import LeagueSetupPage from "@/app/admin/[leagueId]/setup/page";
import SiteAccessSettingsPage from "@/app/admin/[leagueId]/site-access/page";
import StaffPage from "@/app/admin/[leagueId]/staff/page";
import TeamsPage from "@/app/admin/[leagueId]/teams/page";
import SiteLoginPage from "@/app/admin/site-login/page";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type TenantAdminPageProps = {
  params: Promise<{ leagueSlug: string; section?: string[] }>;
  searchParams: Promise<{ q?: string; created?: string }>;
};

export default async function TenantAdminPage({
  params,
  searchParams,
}: TenantAdminPageProps) {
  const { leagueSlug, section = [] } = await params;
  const sectionPath = section.join("/");
  const { data: league } = await supabaseAdmin()
    .from("leagues")
    .select("id, slug")
    .eq("slug", leagueSlug)
    .maybeSingle();

  if (!league) {
    notFound();
  }

  const session = await auth();
  const hasLeagueSession =
    session?.authMethod === "league-admin" &&
    session.siteLeagueId === league.id &&
    session.siteLeagueSlug === league.slug;

  if (sectionPath === "site-login") {
    if (hasLeagueSession) {
      redirect("/admin");
    }
    return SiteLoginPage({
      searchParams: Promise.resolve({ league: leagueSlug }),
    });
  }

  if (!hasLeagueSession) {
    redirect("/admin/site-login");
  }

  const routeParams = Promise.resolve({ leagueId: league.id as string });

  switch (sectionPath) {
    case "":
      return LeagueWorkspacePage({
        params: routeParams,
        searchParams,
      });
    case "setup":
      return LeagueSetupPage({ params: routeParams });
    case "teams":
      return TeamsPage({ params: routeParams });
    case "fixtures":
      return FixturesAdminPage({ params: routeParams });
    case "imports":
      return ImportsPage({ params: routeParams });
    case "collector":
      return CollectorPage({ params: routeParams });
    case "players":
      return PlayerIdentitiesPage({
        params: routeParams,
        searchParams,
      });
    case "divisions":
      return DivisionsPage({
        params: routeParams,
        searchParams,
      });
    case "staff":
      return StaffPage({ params: routeParams });
    case "site-access":
      return SiteAccessSettingsPage({
        params: routeParams,
        searchParams: Promise.resolve({}),
      });
    default:
      notFound();
  }
}

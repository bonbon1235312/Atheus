import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AtelierSite } from "@/components/demos/atelier/site";
import { HearthCoSite } from "@/components/demos/hearth-co/site";
import { RivermarkSite } from "@/components/demos/rivermark/site";
import { DEMO_SITES, getDemoSite } from "@/lib/demo-sites";
import { demoPublicUrl } from "@/lib/public-url";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DEMO_SITES.map((site) => ({ slug: site.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = getDemoSite(slug);
  if (!site) return { title: "Demo" };

  return {
    title: { absolute: `${site.name} · Atheus demo` },
    description: site.description,
    openGraph: {
      title: site.name,
      description: site.description,
      url: demoPublicUrl(site.slug),
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DemoSitePage({ params }: Props) {
  const { slug } = await params;
  const site = getDemoSite(slug);
  if (!site) notFound();

  if (slug === "hearth-co") return <HearthCoSite />;
  if (slug === "rivermark") return <RivermarkSite />;
  if (slug === "atelier") return <AtelierSite />;

  notFound();
}

import type { Metadata } from "next";

// Vercel redirects the apex domain to www, so all public search signals use www.
export const SITE_ORIGIN = "https://www.atheus.dev";
export const SITE_NAME = "Atheus";
export const HOME_TITLE = "Atheus — Independent Digital Design Studio";
export const HOME_DESCRIPTION =
  "Atheus is an independent UK digital design and development studio creating expressive websites, digital products and brand experiences.";

type PageMetadata = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
};

export function marketingMetadata({
  title,
  description,
  path,
  image = "/opengraph-image",
  imageAlt = "Atheus independent digital design studio",
}: PageMetadata): Metadata {
  const url = new URL(path, SITE_ORIGIN).toString();

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [{ url: image, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

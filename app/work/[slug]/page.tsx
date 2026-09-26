import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { StructuredData } from "@/components/marketing/structured-data";
import { breadcrumbSchema, marketingMetadata } from "@/lib/seo";

const concepts = [
  { slug: "hearth-and-co", name: "Hearth & Co", category: "Hospitality", headline: "A digital welcome, before the first coffee.", demo: "hearth-co", image: "/work/hearth-desktop.webp", idea: "Make a neighbourhood cafe feel familiar before someone walks through the door. The concept brings atmosphere, the menu and a visit-planning journey into the same place.", direction: "Warm photography and menu-inspired typography set the tone. The layout moves between the feel of the place and the practical details people need to plan a visit.", interaction: "A filterable menu lets visitors explore what interests them. A booking calendar demonstrates the reservation journey, with the phone experience considered alongside desktop.", lesson: "Atmosphere earns attention. Clear opening information, a readable menu and an obvious next step make that attention useful.", next: "ridgeway-civils" },
  { slug: "ridgeway-civils", name: "Ridgeway Civils", category: "Construction", headline: "Built with the weight of the work.", demo: "ridgeway", image: "/work/ridgeway-desktop.webp", idea: "Explore how a civils contractor can communicate capability without losing the directness of the industry. Visitors need to understand the work, assess the fit and find a clear enquiry route.", direction: "Heavy typography, plant photography and an industrial grid make the subject matter part of the visual language. The composition is deliberately robust, with a practical hierarchy.", interaction: "The concept puts services and project enquiries at the centre of the journey. The construction-specific opening animation extends the identity into motion.", lesson: "Confidence comes from presenting capabilities clearly. The design gives the work room and keeps the enquiry route easy to find.", next: "northline-electrical" },
  { slug: "northline-electrical", name: "Northline Electrical", category: "Trades", headline: "One site. Two very different moments.", demo: "northline", image: "/work/northline-desktop.webp", idea: "An urgent electrical problem and a planned commercial installation need different paths. This concept explores how one website can serve both without making either visitor work too hard.", direction: "Precise typography and a bright electrical accent give the site energy. Service information is organised around the visitor’s situation, with a direct call-out route alongside project enquiries.", interaction: "A service selector and quote questionnaire demonstrate a guided enquiry. The lightning-bolt loader adds personality to the opening without changing the service hierarchy.", lesson: "The most useful visual hierarchy starts with the reason someone arrived. Urgency should have a direct path; considered projects need space for detail.", next: "kickoff" },
] as const;

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return concepts.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = concepts.find((item) => item.slug === slug);
  if (!project) return {};
  return marketingMetadata({ title: `${project.name} Website Concept | Atheus`, description: project.idea, path: `/work/${slug}`, image: project.image });
}
export default async function ConceptCaseStudy({ params }: Props) {
  const { slug } = await params;
  const project = concepts.find((item) => item.slug === slug);
  if (!project) notFound();
  return <MarketingShell variant="agency">
    <StructuredData data={breadcrumbSchema([{ name: "Atheus", path: "/" }, { name: "Work", path: "/work" }, { name: project.name, path: `/work/${slug}` }])} />
    <section className="studio-case-hero studio-concept-hero ax-container"><div className="agency-section-label"><Link href="/work">← Selected work</Link><span>{project.category} / Concept</span></div><div className="studio-case-title"><h1>{project.name}<span>.</span></h1><p>{project.headline}</p></div><div className="studio-case-meta"><span>Art direction</span><span>Web design</span><span>Development</span><Link href={`/demos/${project.demo}`}>Explore the concept ↗</Link></div></section>
    <figure className="studio-case-cover ax-container"><Image src={project.image} alt={`${project.name} concept website, desktop view`} width={1440} height={1000} sizes="(max-width: 760px) 100vw, 90vw" preload /><figcaption>Self-initiated concept / Not a commissioned client project.</figcaption></figure>
    <section className="studio-editorial ax-container"><div className="studio-section-side"><span className="studio-eyebrow">01 / The brief</span><h2>A specific audience.<br /><em>A distinct voice.</em></h2></div><div className="studio-prose"><p className="studio-lead">{project.idea}</p><p>This is an exploratory build demonstrating Atheus’s design and development approach. The business identity and journeys are part of the concept; they are not evidence of client results.</p></div></section>
    <section className="studio-concept-notes ax-container"><article><span className="studio-eyebrow">02 / Visual direction</span><h2>Let the subject<br /><em>shape the design.</em></h2><p>{project.direction}</p></article><article><span className="studio-eyebrow">03 / Interaction</span><h2>Give attention<br /><em>somewhere to go.</em></h2><p>{project.interaction}</p></article></section>
    <section className="studio-editorial studio-outcome ax-container"><div className="studio-section-side"><span className="studio-eyebrow">04 / The thinking</span><h2>What makes<br /><em>it work.</em></h2></div><div className="studio-prose"><p className="studio-lead">{project.lesson}</p><Link className="agency-btn" href={`/demos/${project.demo}`}>Explore the concept ↗</Link><p className="studio-source">Demo forms and business details are illustrative. They do not place real bookings or service requests.</p><Link className="agency-arrow-link" href={`/work/${project.next}`}>Next project ↗</Link></div></section>
  </MarketingShell>;
}


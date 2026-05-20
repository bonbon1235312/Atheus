import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for ATHEUS.",
};

export default function TermsPage() {
  return (
    <main className="section-pad">
      <div className="container-studio max-w-3xl">
        <p className="kicker">Legal</p>
        <h1 className="type-display mt-4 text-7xl font-semibold leading-none">
          Terms
        </h1>
        <div className="mt-10 grid gap-6 text-lg text-chalk/70">
          <p>
            This website is provided as a portfolio and enquiry site for ATHEUS.
            Content is for general information and may change without notice.
          </p>
          <p>
            Portfolio concepts shown on this site are fictional demonstration
            projects unless otherwise stated. They are used to show design,
            frontend, and creative direction capability.
          </p>
          <p>
            Project scope, timelines, deliverables, hosting, support, and payment
            terms are agreed separately in writing before paid work begins.
          </p>
          <p>
            For questions about these terms, email hello@atheus.dev.
          </p>
        </div>
      </div>
    </main>
  );
}

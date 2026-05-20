import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { MotionReveal } from "@/components/site/motion-reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a web design or frontend development project with ATHEUS.",
};

export default function ContactPage() {
  return (
    <main>
      <section className="section-pad">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <MotionReveal>
            <p className="kicker">Contact</p>
            <h1 className="type-display mt-4 text-7xl font-semibold leading-none md:text-8xl">
              Tell me what needs to change.
            </h1>
            <p className="mt-6 max-w-xl text-xl text-chalk/68">
              Send the business, the problem, and the kind of site you need.
              You can use the form or email directly at{" "}
              <a className="font-bold text-chalk" href="mailto:hello@atheus.dev">
                hello@atheus.dev
              </a>
              .
            </p>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <ContactForm />
          </MotionReveal>
        </div>
      </section>
    </main>
  );
}

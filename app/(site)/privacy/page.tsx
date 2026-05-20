import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for ATHEUS.",
};

export default function PrivacyPage() {
  return (
    <main className="section-pad">
      <div className="container-studio max-w-3xl">
        <p className="kicker">Legal</p>
        <h1 className="type-display mt-4 text-7xl font-semibold leading-none">
          Privacy Policy
        </h1>
        <div className="mt-10 grid gap-6 text-lg text-chalk/70">
          <p>
            ATHEUS collects only the information needed to respond to project
            enquiries, such as name, email address, business name, project
            details, and messages sent through the contact form or email.
          </p>
          <p>
            Enquiry information is used to reply to messages, scope potential
            projects, and keep a record of project conversations. It is not sold
            or shared with third-party marketers.
          </p>
          <p>
            If analytics, hosting tools, or form services are added in future,
            this policy will be updated to explain what is collected and why.
          </p>
          <p>
            To request removal of enquiry data, email hello@atheus.dev.
          </p>
        </div>
      </div>
    </main>
  );
}

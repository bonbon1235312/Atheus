export function HawthorneDemo() {
  return (
    <main className="demo-page bg-[#f2eadc] text-[#171512]">
      <header className="border-b border-[#171512]/15 bg-[#f2eadc]/92">
        <div className="demo-container flex min-h-20 items-center justify-between gap-4">
          <a href="#" className="type-display text-3xl font-semibold">Hawthorne Electrical</a>
          <nav className="hidden gap-6 text-sm font-bold md:flex" aria-label="Hawthorne navigation">
            <a href="#services">Services</a>
            <a href="#proof">Proof</a>
            <a href="#process">Process</a>
            <a href="#contact">Contact</a>
          </nav>
          <a href="tel:01142004480" className="demo-button bg-[#a84834] text-white">Call 0114 200 4480</a>
        </div>
      </header>

      <section className="demo-section">
        <div className="demo-container grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="font-black text-[#a84834]">Sheffield electrical contractors</p>
            <h1 className="type-display mt-4 text-7xl font-semibold leading-none md:text-8xl">
              Electrical work, done properly.
            </h1>
            <p className="mt-6 max-w-xl text-xl text-[#171512]/72">
              Domestic and commercial electricians for callouts, inspections,
              rewires, lighting, EV chargers, and the jobs that need a straight
              answer before anyone touches the fuse board.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="tel:01142004480" className="demo-button bg-[#171512] text-[#f2eadc]">Call now</a>
              <a href="#contact" className="demo-button border border-[#171512]/25">Request a quote</a>
            </div>
          </div>
          <aside className="border border-[#171512]/16 bg-[#171512] p-5 text-[#f2eadc]">
            <p className="text-sm font-black text-[#c59a57]">Emergency callout</p>
            <h2 className="type-display mt-4 text-5xl font-semibold leading-none">Clear advice before the invoice.</h2>
            <ul className="mt-8 grid gap-4 text-[#f2eadc]/76">
              <li className="flex justify-between gap-4 border-t border-white/12 pt-3"><span>Typical response</span><strong>Under 60 mins</strong></li>
              <li className="flex justify-between gap-4 border-t border-white/12 pt-3"><span>Certification</span><strong>NICEIC registered</strong></li>
              <li className="flex justify-between gap-4 border-t border-white/12 pt-3"><span>Coverage</span><strong>South Yorkshire</strong></li>
            </ul>
          </aside>
        </div>
      </section>

      <section id="proof" className="border-y border-[#171512]/15 bg-[#171512] py-6 text-[#f2eadc]">
        <div className="demo-container grid gap-4 md:grid-cols-4">
          {["24/7 callouts", "Fixed quotes", "18 years trading", "Fully insured"].map((item) => (
            <p key={item} className="font-black">{item}</p>
          ))}
        </div>
      </section>

      <section id="services" className="demo-section">
        <div className="demo-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-black text-[#a84834]">Jobs handled</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">The useful list, not a vague service cloud.</h2>
          </div>
          <div className="grid gap-0">
            {[
              ["Emergency faults", "Tripping circuits, burning smells, partial power loss, unsafe fittings."],
              ["Rewires and upgrades", "Full rewires, partial rewires, consumer units, safety checks."],
              ["Lighting and sockets", "Kitchen lighting, outdoor power, extra sockets, smart controls."],
              ["Commercial maintenance", "Landlords, shops, offices, small industrial units, test schedules."],
            ].map(([title, copy]) => (
              <article key={title} className="grid gap-4 border-t border-[#171512]/18 py-6 md:grid-cols-[0.45fr_1fr]">
                <h3 className="text-2xl font-black">{title}</h3>
                <p className="text-[#171512]/70">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="demo-section bg-[#e6d8c4]">
        <div className="demo-container">
          <h2 className="type-display text-6xl font-semibold leading-none">How the job moves.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Call or send photos", "We confirm urgency and give the clearest next step."],
              ["02", "Quote before work", "No mystery labour, no surprise parts without approval."],
              ["03", "Certify and tidy", "The job is tested, documented, and left clean."],
            ].map(([number, title, copy]) => (
              <article key={title} className="border-t border-[#171512]/20 pt-5">
                <p className="font-black text-[#a84834]">{number}</p>
                <h3 className="mt-4 text-2xl font-black">{title}</h3>
                <p className="mt-3 text-[#171512]/70">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="demo-section">
        <div className="demo-container grid gap-8 border border-[#171512]/18 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-black text-[#a84834]">Need an electrician?</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">Call first. Decide with facts.</h2>
            <p className="mt-5 max-w-xl text-[#171512]/70">Tell us what has happened, where you are, and whether power is currently safe. We will talk you through the next step.</p>
          </div>
          <a href="tel:01142004480" className="demo-button bg-[#a84834] text-white">Call Hawthorne</a>
        </div>
      </section>
    </main>
  );
}

export function ForgeHouseDemo() {
  return (
    <main className="demo-page bg-[#070707] text-[#f3ead8]">
      <header className="border-b border-white/12">
        <div className="demo-container flex min-h-20 items-center justify-between gap-4">
          <a href="#" className="text-3xl font-black">FORGE HOUSE</a>
          <nav className="hidden gap-6 text-sm font-black md:flex" aria-label="Forge House navigation">
            <a href="#classes">Classes</a>
            <a href="#coaching">Coaching</a>
            <a href="#week">First week</a>
            <a href="#trial">Trial</a>
          </nav>
          <a href="#trial" className="demo-button bg-[#ed6a24] text-black">Book trial</a>
        </div>
      </header>

      <section className="demo-section">
        <div className="demo-container grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div className="min-w-0">
            <p className="font-black text-[#ed6a24]">Strength gym in Leeds</p>
            <h1 className="mt-4 max-w-4xl text-6xl font-black leading-none sm:text-7xl md:text-9xl">
              Train hard. Stay consistent.
            </h1>
            <p className="mt-6 max-w-xl text-xl text-[#f3ead8]/68">
              Coached strength sessions, structured classes, and a first week
              that helps new members stop guessing and start training properly.
            </p>
            <a href="#trial" className="demo-button mt-8 bg-[#ed6a24] text-black">Start 7-day trial</a>
          </div>
          <div className="grid gap-3">
            {["Small-group lifting", "Conditioning that supports strength", "Open gym with real coaching"].map((item) => (
              <p key={item} className="border border-white/12 p-5 text-2xl font-black">{item}</p>
            ))}
          </div>
        </div>
      </section>

      <section id="classes" className="demo-section border-y border-white/12 bg-[#111]">
        <div className="demo-container">
          <h2 className="text-6xl font-black leading-none">Classes with a point.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Lift Club", "Squat, bench, deadlift, and accessory work with coach feedback."],
              ["Engine Room", "Sleds, carries, intervals, and conditioning that does not wreck recovery."],
              ["Open Gym", "Platforms, calibrated plates, and programming support."],
            ].map(([title, copy]) => (
              <article key={title} className="border-t border-white/16 pt-5">
                <h3 className="text-3xl font-black text-[#ed6a24]">{title}</h3>
                <p className="mt-3 text-[#f3ead8]/68">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="coaching" className="demo-section">
        <div className="demo-container grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <h2 className="text-6xl font-black leading-none">Coaching without ego.</h2>
          <p className="text-xl text-[#f3ead8]/70">Forge House is built for people who want structure, not theatre. Every session has a coach, a plan, and a reason behind the work.</p>
        </div>
      </section>

      <section id="week" className="demo-section bg-[#ed6a24] text-black">
        <div className="demo-container">
          <h2 className="text-6xl font-black leading-none">Your first week.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Intro lift", "Set your starting numbers and learn the room."],
              ["02", "Two classes", "Try strength and conditioning with scaling."],
              ["03", "Plan forward", "Choose the membership that fits your training."],
            ].map(([number, title, copy]) => (
              <article key={title} className="border-t border-black/24 pt-5">
                <p className="font-black">{number}</p>
                <h3 className="mt-4 text-3xl font-black">{title}</h3>
                <p className="mt-3 text-black/70">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="trial" className="demo-section">
        <div className="demo-container grid gap-8 border border-white/12 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-black text-[#ed6a24]">Trial membership</p>
            <h2 className="text-6xl font-black leading-none">One week. Real coaching. No sales script.</h2>
            <p className="mt-5 max-w-xl text-[#f3ead8]/68">Includes an intro, two classes, and open gym access.</p>
          </div>
          <a href="mailto:hello@forgehouseathletics.co.uk" className="demo-button bg-[#f3ead8] text-black">Book trial</a>
        </div>
        <div className="demo-container mt-8 text-[#f3ead8]/60">16 Foundry Yard, Holbeck, Leeds</div>
      </section>
    </main>
  );
}

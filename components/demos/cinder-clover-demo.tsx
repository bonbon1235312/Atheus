export function CinderCloverDemo() {
  return (
    <main className="demo-page bg-[#f7f1e7] text-[#241814]">
      <header className="border-b border-[#241814]/12">
        <div className="demo-container flex min-h-20 items-center justify-between gap-4">
          <a href="#" className="type-display text-3xl font-semibold">Cinder &amp; Clover</a>
          <nav className="hidden gap-6 text-sm font-bold md:flex" aria-label="Cinder and Clover navigation">
            <a href="#menu">Menu</a>
            <a href="#hire">Private hire</a>
            <a href="#visit">Visit</a>
          </nav>
          <a href="#book" className="demo-button bg-[#aa6348] text-white">Reserve brunch</a>
        </div>
      </header>

      <section className="demo-section">
        <div className="demo-container grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="font-black text-[#aa6348]">York neighbourhood cafe</p>
            <h1 className="type-display mt-4 text-7xl font-semibold leading-none md:text-8xl">
              Slow coffee. Sharp brunch.
            </h1>
            <p className="mt-6 max-w-xl text-xl text-[#241814]/70">House pastries, all-day brunch, proper coffee, and private tables after hours just behind Micklegate.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#book" className="demo-button bg-[#241814] text-[#f7f1e7]">Reserve brunch</a>
              <a href="#menu" className="demo-button border border-[#241814]/20">See menu</a>
            </div>
          </div>
          <aside className="bg-[#241814] p-5 text-[#f7f1e7]">
            <p className="font-black text-[#d4a66a]">Today at the counter</p>
            <h2 className="type-display mt-4 text-5xl font-semibold leading-none">Cardamom buns. Pistachio loaf. Tomato tart.</h2>
            <p className="mt-5 text-[#f7f1e7]/70">The pastry shelf is baked before sunrise and rarely survives the afternoon.</p>
          </aside>
        </div>
      </section>

      <section id="menu" className="demo-section bg-white/60">
        <div className="demo-container grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-black text-[#aa6348]">Brunch board</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">Comfort, with a clean edge.</h2>
          </div>
          <div className="grid gap-4">
            {[
              ["Smoked chilli eggs", "Whipped labneh, pickled shallot, focaccia", "11.50"],
              ["Brown butter mushrooms", "Feta, dill, sourdough", "12"],
              ["Ricotta hotcakes", "Rhubarb, maple cream, almonds", "10.80"],
            ].map(([name, detail, price]) => (
              <article key={name} className="grid gap-2 border-t border-[#241814]/16 py-5 md:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="text-2xl font-black">{name}</h3>
                  <p className="text-[#241814]/64">{detail}</p>
                </div>
                <p className="text-2xl font-black">£{price}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="hire" className="demo-section">
        <div className="demo-container grid gap-8 md:grid-cols-[1fr_1fr]">
          <h2 className="type-display text-6xl font-semibold leading-none">Private tables without event-room stiffness.</h2>
          <div>
            <p className="text-xl text-[#241814]/70">Breakfast meetings, small birthdays, creative sessions, and supper clubs for 8 to 24 guests.</p>
            <ul className="mt-6 grid gap-3 text-[#241814]/70">
              <li>- Fixed menus from the cafe kitchen</li>
              <li>- Dietary planning before arrival</li>
              <li>- Calm service in the back room</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="book" className="demo-section bg-[#241814] text-[#f7f1e7]">
        <div className="demo-container grid gap-8 md:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="font-black text-[#d4a66a]">Book</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">Reserve brunch or ask about a private table.</h2>
          </div>
          <form className="grid gap-3">
            <input className="rounded-md bg-[#f7f1e7] px-4 py-3 text-[#241814]" placeholder="Name" />
            <input className="rounded-md bg-[#f7f1e7] px-4 py-3 text-[#241814]" placeholder="Email" />
            <button className="demo-button bg-[#aa6348] text-white" type="button">Send request</button>
          </form>
        </div>
      </section>

      <section id="visit" className="border-t border-[#241814]/12 py-10">
        <div className="demo-container grid gap-4 md:grid-cols-3">
          <p>14 Willow Lane, York</p>
          <p>Mon to Fri 8-5, Sat 9-6, Sun 9-4</p>
          <p>hello@cinderandclover.co.uk</p>
        </div>
      </section>
    </main>
  );
}

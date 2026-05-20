const menu = [
  ["Cured trout, rhubarb, rye", "12"],
  ["Lancashire souffle, walnut", "11"],
  ["Galloway short rib, leeks", "24"],
  ["Roast celeriac, wild garlic", "18"],
  ["Rhubarb custard, shortbread", "9"],
];

export function SaplingsDemo() {
  return (
    <main className="demo-page bg-[#17110e] text-[#f4ead8]">
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="demo-container flex min-h-24 items-center justify-between gap-4">
          <a href="#" className="type-display text-4xl font-semibold">Saplings</a>
          <nav className="hidden gap-7 text-sm font-bold md:flex" aria-label="Saplings navigation">
            <a href="#menu">Menu</a>
            <a href="#note">Chef note</a>
            <a href="#book">Book</a>
            <a href="#visit">Visit</a>
          </nav>
          <a href="#book" className="demo-button border border-[#f4ead8]/35">Reserve table</a>
        </div>
      </header>

      <section className="relative grid min-h-[760px] items-end overflow-hidden pb-20 pt-32">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(23,17,14,.25), #17110e 92%), linear-gradient(120deg, rgba(196,122,76,.42), transparent 50%), repeating-linear-gradient(90deg, rgba(244,234,216,.08) 0 1px, transparent 1px 80px), #2b1b14",
          }}
        />
        <div className="demo-container relative">
          <p className="font-black text-[#c47a4c]">Northern Quarter, Manchester</p>
          <h1 className="type-display mt-5 max-w-4xl text-7xl font-semibold leading-none md:text-9xl">
            Saplings
          </h1>
          <p className="mt-5 max-w-2xl text-3xl leading-tight">Seasonal neighbourhood bistro.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#book" className="demo-button bg-[#f4ead8] text-[#17110e]">Reserve table</a>
            <a href="#menu" className="demo-button border border-[#f4ead8]/30">View menu</a>
          </div>
        </div>
      </section>

      <section id="menu" className="demo-section">
        <div className="demo-container grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="font-black text-[#c47a4c]">This week</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">A menu that changes with the growers.</h2>
          </div>
          <div className="border-y border-[#f4ead8]/18 py-5">
            {menu.map(([dish, price]) => (
              <div key={dish} className="grid grid-cols-[auto_1fr_auto] items-end gap-3 border-b border-[#f4ead8]/10 py-4 last:border-b-0">
                <span className="text-xl font-semibold">{dish}</span>
                <span className="mb-2 border-b border-dotted border-[#f4ead8]/24" />
                <span className="text-xl font-black">£{price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="note" className="demo-section bg-[#f4ead8] text-[#17110e]">
        <div className="demo-container grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
          <blockquote className="type-display text-6xl font-semibold leading-none">
            &quot;We do not write the menu first. We call the farms first.&quot;
          </blockquote>
          <div>
            <p className="font-black text-[#c47a4c]">Chef note</p>
            <p className="mt-4 text-xl text-[#17110e]/70">Twenty-eight seats, one open kitchen, and produce sourced from small northern suppliers. The room feels relaxed, but the menu is precise.</p>
          </div>
        </div>
      </section>

      <section id="book" className="demo-section">
        <div className="demo-container grid gap-8 border border-[#f4ead8]/14 p-6 md:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="font-black text-[#c47a4c]">Reservations</p>
            <h2 className="type-display mt-3 text-6xl font-semibold leading-none">Book the dining room or take a counter seat.</h2>
            <p className="mt-5 text-[#f4ead8]/68">Dinner books two weeks ahead. A few counter seats are kept for walk-ins every service.</p>
          </div>
          <form className="grid gap-3">
            <input className="rounded-md border-[#f4ead8]/10 bg-[#f4ead8] px-4 py-3 text-[#17110e]" placeholder="Name" />
            <input className="rounded-md border-[#f4ead8]/10 bg-[#f4ead8] px-4 py-3 text-[#17110e]" placeholder="Email" />
            <button className="demo-button bg-[#c47a4c] text-white" type="button">Request table</button>
          </form>
        </div>
      </section>

      <section id="visit" className="border-t border-[#f4ead8]/12 py-10">
        <div className="demo-container grid gap-4 md:grid-cols-3">
          <p>42 Tib Street, Manchester</p>
          <p>Wed to Sun, lunch and dinner</p>
          <p>hello@saplings.uk</p>
        </div>
      </section>
    </main>
  );
}

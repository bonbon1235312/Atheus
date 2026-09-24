export function BeliefStack({ lines }: { lines: string[] }) {
  return (
    <section className="ax-section">
      <div className="ax-container">
        <p className="ax-kicker-pill">Beliefs</p>

        <ul className="ax-belief-stack">
          {lines.map((line, index) => (
            <li key={line}>
              <span className="ax-belief-index">0{index + 1}</span>
              <p>{line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

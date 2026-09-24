export function CascadeList({
  title,
  lead,
  items,
}: {
  title: string;
  lead: string;
  items: string[];
}) {
  return (
    <section className="ax-section" style={{ paddingTop: 0 }}>
      <div className="ax-container ax-split">
        <div>
          <h2 className="ax-h2">{title}</h2>
          <p className="ax-lead">{lead}</p>
        </div>

        <ul className="ax-cascade-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

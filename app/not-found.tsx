import Link from "next/link";

export default function NotFound() {
  return (
    <main className="access-page">
      <Link className="wordmark" href="/">
        <span className="wordmark-mark">A</span>
        <span>ATHEUS</span>
      </Link>
      <section className="access-panel">
        <p className="eyebrow">404 / Not found</p>
        <h1>This route does not exist.</h1>
        <Link className="button button-primary" href="/">
          Return home
        </Link>
      </section>
    </main>
  );
}

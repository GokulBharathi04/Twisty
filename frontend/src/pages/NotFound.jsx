import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[70vh] flex-col items-start justify-center pt-32" data-testid="not-found">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-5xl font-black uppercase sm:text-7xl">Page not found</h1>
      <Link to="/" className="btn-red mt-8" data-testid="not-found-home-link">Back to home</Link>
    </section>
  );
}

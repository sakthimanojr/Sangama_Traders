import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-page py-24 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-ink-700">The page you are looking for does not exist or is no longer available.</p>
      <Link href="/catalogue" className="btn btn-primary mt-6">
        Browse the catalogue
      </Link>
    </main>
  );
}

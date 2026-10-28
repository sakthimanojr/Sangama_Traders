import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { site } from "@/config/site";
import { requireAdminPage } from "@/server/auth/guard";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  // Second line of defence after the middleware.
  await requireAdminPage();

  return (
    <>
      <header className="border-b border-ink-100 bg-white">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display font-bold text-ink-900">
              {site.name} <span className="font-normal text-ink-500">Admin</span>
            </Link>
            <nav aria-label="Admin" className="flex items-center gap-4 text-sm font-medium text-ink-700">
              <Link href="/admin" className="hover:text-brand-600">
                Products
              </Link>
              <Link href="/admin/enquiries" className="hover:text-brand-600">
                Enquiries
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-sm text-ink-600 hover:text-brand-600">
              View site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="container-page py-8">{children}</main>
    </>
  );
}

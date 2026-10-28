import type { Metadata } from "next";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { ENQUIRIES_PAGE_SIZE, listEnquiries } from "@/server/products/admin-queries";

export const metadata: Metadata = { title: "Enquiries" };

type Props = { searchParams: Promise<{ page?: string }> };

export default async function EnquiriesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const { rows, total } = await listEnquiries(page);
  const pages = Math.max(1, Math.ceil(total / ENQUIRIES_PAGE_SIZE));

  return (
    <>
      <h1 className="text-2xl font-bold">Enquiries</h1>
      <p className="mt-1 text-sm text-ink-600">
        {total} total. Newest first.
      </p>

      {rows.length === 0 ? (
        <p className="card mt-6 p-6 text-sm text-ink-700">No enquiries yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink-950">{row.name}</p>
                  <p className="text-sm">
                    <a href={`mailto:${row.email}`} className="text-brand-600 hover:text-brand-700">
                      {row.email}
                    </a>
                    {row.company ? <span className="text-ink-600"> &middot; {row.company}</span> : null}
                  </p>
                </div>
                <p className="text-xs text-ink-600">{formatDateTime(row.createdAt)}</p>
              </div>
              {row.productName ? (
                <p className="mt-3 text-sm text-ink-700">
                  About:{" "}
                  {row.productSlug ? (
                    <Link href={`/products/${row.productSlug}`} target="_blank" className="font-medium text-brand-600">
                      {row.productName}
                    </Link>
                  ) : (
                    row.productName
                  )}
                </p>
              ) : null}
              <p className="mt-3 whitespace-pre-line text-sm text-ink-900">{row.message}</p>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 ? (
        <nav aria-label="Pages" className="mt-6 flex items-center gap-3 text-sm">
          {page > 1 ? (
            <Link href={`/admin/enquiries?page=${page - 1}`} className="btn btn-secondary btn-sm">
              Newer
            </Link>
          ) : null}
          <span className="text-ink-600">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={`/admin/enquiries?page=${page + 1}`} className="btn btn-secondary btn-sm">
              Older
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}

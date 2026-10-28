import type { Status } from "@/lib/categories";

export function StatusBadge({ status }: { status: Status }) {
  const published = status === "published";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

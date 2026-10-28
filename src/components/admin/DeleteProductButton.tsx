"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { productId: string; productName: string; redirectTo?: string };

export function DeleteProductButton({ productId, productName, redirectTo }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    const ok = window.confirm(
      `Delete "${productName}"?\n\nThis also deletes its images and documents from Cloudinary. It cannot be undone.`,
    );
    if (!ok) return;

    setBusy(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      const body = (await response.json().catch(() => ({}))) as { error?: string; warning?: string };
      if (!response.ok) {
        window.alert(body.error ?? "Could not delete the product.");
        setBusy(false);
        return;
      }
      if (body.warning) window.alert(body.warning);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch {
      window.alert("Network error. The product was not deleted.");
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={remove} disabled={busy} className="btn btn-danger btn-sm">
      {busy ? "Deleting..." : "Delete"}
    </button>
  );
}

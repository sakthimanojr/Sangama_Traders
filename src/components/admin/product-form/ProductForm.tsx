"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, categoryLabels, type Category, type Status } from "@/lib/categories";
import { toFieldErrors, type FieldErrors } from "@/lib/validation/errors";
import { productInputSchema } from "@/lib/validation/product";
import { DocumentsEditor } from "./DocumentsEditor";
import { Field } from "./Field";
import { ImagesEditor } from "./ImagesEditor";
import { SpecsEditor } from "./SpecsEditor";
import type { DocumentItem, ImageItem, ProductFormInitial, SpecRow } from "./types";

type ApiResponse = { error?: string; errors?: FieldErrors; warning?: string };

export function ProductForm({ initial }: { initial?: ProductFormInitial }) {
  const router = useRouter();
  const editing = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? CATEGORIES[0]);
  const [hsCode, setHsCode] = useState(initial?.hsCode ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [specs, setSpecs] = useState<SpecRow[]>(
    () => initial?.specs.map((spec) => ({ key: crypto.randomUUID(), ...spec })) ?? [],
  );
  const [images, setImages] = useState<ImageItem[]>(
    () =>
      initial?.images.map((image) => ({
        key: crypto.randomUUID(),
        fileName: image.publicId.split("/").pop() ?? "image",
        status: "done" as const,
        progress: 100,
        ...image,
      })) ?? [],
  );
  const [documents, setDocuments] = useState<DocumentItem[]>(
    () =>
      initial?.documents.map((doc) => ({
        key: crypto.randomUUID(),
        fileName: doc.publicId.split("/").pop() ?? "document",
        status: "done" as const,
        progress: 100,
        ...doc,
      })) ?? [],
  );

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Status | null>(null);

  async function save(status: Status) {
    setFormError(null);

    if ([...images, ...documents].some((item) => item.status === "uploading")) {
      setFormError("Please wait for the uploads to finish.");
      return;
    }
    if ([...images, ...documents].some((item) => item.status === "error")) {
      setFormError("Remove the files that failed to upload, or upload them again.");
      return;
    }

    const payload = {
      name,
      category,
      hsCode,
      description,
      status,
      specs: specs.map(({ label, value }) => ({ label, value })),
      images: images.map((image) => ({
        id: image.id,
        publicId: image.publicId,
        url: image.url,
        width: image.width,
        height: image.height,
        altText: image.altText,
        isCover: image.isCover,
      })),
      documents: documents.map((doc) => ({ id: doc.id, publicId: doc.publicId, url: doc.url, title: doc.title })),
    };

    const checked = productInputSchema.safeParse(payload);
    if (!checked.success) {
      setErrors(toFieldErrors(checked.error.issues));
      setFormError("Please fix the highlighted fields.");
      return;
    }
    setErrors({});

    setSaving(status);
    try {
      const response = await fetch(editing ? `/api/admin/products/${initial?.id}` : "/api/admin/products", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checked.data),
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }
        setErrors(body.errors ?? {});
        setFormError(body.error ?? "Could not save the product.");
        setSaving(null);
        return;
      }

      if (body.warning) window.alert(body.warning);
      router.push("/admin");
      router.refresh();
    } catch {
      setFormError("Network error. Nothing was saved. Please try again.");
      setSaving(null);
    }
  }

  const busy = saving !== null;
  const uploading = [...images, ...documents].some((item) => item.status === "uploading");

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void save(initial?.status ?? "draft");
      }}
      className="space-y-6"
    >
      {formError ? (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {formError}
        </p>
      ) : null}

      <fieldset className="card space-y-4 p-5">
        <legend className="px-1 text-base font-semibold">Details</legend>

        <Field id="name" label="Name" error={errors.name}>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            className={`input ${errors.name ? "input-error" : ""}`}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="category" label="Category" error={errors.category}>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
              className="input"
            >
              {CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {categoryLabels[value]}
                </option>
              ))}
            </select>
          </Field>

          <Field id="hsCode" label="HS code" error={errors.hsCode} hint="Optional. For example 0810.90 or 08109000">
            <input
              id="hsCode"
              value={hsCode}
              onChange={(event) => setHsCode(event.target.value)}
              inputMode="numeric"
              className={`input ${errors.hsCode ? "input-error" : ""}`}
            />
          </Field>
        </div>

        <Field id="description" label="Description" error={errors.description}>
          <textarea
            id="description"
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`input ${errors.description ? "input-error" : ""}`}
          />
        </Field>
      </fieldset>

      <SpecsEditor specs={specs} setSpecs={setSpecs} errors={errors} />
      <ImagesEditor images={images} setImages={setImages} errors={errors} />
      <DocumentsEditor documents={documents} setDocuments={setDocuments} errors={errors} />

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-ink-100 bg-white/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <button type="button" disabled={busy || uploading} onClick={() => void save("draft")} className="btn btn-secondary">
          {saving === "draft" ? "Saving..." : "Save as draft"}
        </button>
        <button type="button" disabled={busy || uploading} onClick={() => void save("published")} className="btn btn-primary">
          {saving === "published" ? "Publishing..." : editing && initial?.status === "published" ? "Save and keep published" : "Publish"}
        </button>
        {uploading ? <span className="text-sm text-ink-600">Uploads in progress...</span> : null}
        <button type="button" onClick={() => router.push("/admin")} disabled={busy} className="ml-auto text-sm text-ink-600 hover:text-brand-600">
          Cancel
        </button>
      </div>
    </form>
  );
}

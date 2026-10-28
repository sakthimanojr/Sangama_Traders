"use client";

import { useRef, useState, type Dispatch, type DragEvent, type SetStateAction } from "react";
import { thumbUrl } from "@/lib/cloudinary-url";
import type { FieldErrors } from "@/lib/validation/errors";
import type { ImageItem } from "./types";
import { altFromFileName, checkFile, uploadToCloudinary } from "./upload-client";

type Props = {
  images: ImageItem[];
  setImages: Dispatch<SetStateAction<ImageItem[]>>;
  errors: FieldErrors;
};

const MAX_IMAGES = 12;

export function ImagesEditor({ images, setImages, errors }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function patch(key: string, changes: Partial<ImageItem>) {
    setImages((items) => items.map((item) => (item.key === key ? { ...item, ...changes } : item)));
  }

  async function startUpload(file: File, key: string) {
    try {
      const result = await uploadToCloudinary(file, "image", (progress) => patch(key, { progress }));
      setImages((items) => {
        const item = items.find((entry) => entry.key === key);
        if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
        return items.map((entry) =>
          entry.key === key
            ? { ...entry, ...result, status: "done" as const, progress: 100, previewUrl: undefined }
            : entry,
        );
      });
    } catch (error) {
      patch(key, { status: "error", error: error instanceof Error ? error.message : "Upload failed." });
    }
  }

  function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const room = MAX_IMAGES - images.length;
    const problems: string[] = [];
    const accepted: File[] = [];

    for (const file of files) {
      const problem = checkFile(file, "image");
      if (problem) problems.push(`${file.name}: ${problem}`);
      else if (accepted.length < room) accepted.push(file);
      else problems.push(`${file.name}: the limit is ${MAX_IMAGES} images.`);
    }
    setNotice(problems.length > 0 ? problems.join(" ") : null);
    if (accepted.length === 0) return;

    const created: { file: File; item: ImageItem }[] = accepted.map((file, index) => ({
      file,
      item: {
        key: crypto.randomUUID(),
        fileName: file.name,
        status: "uploading",
        progress: 0,
        previewUrl: URL.createObjectURL(file),
        altText: altFromFileName(file.name),
        isCover: images.length === 0 && index === 0,
      },
    }));

    setImages((items) => [...items, ...created.map((entry) => entry.item)]);
    for (const { file, item } of created) void startUpload(file, item.key);
  }

  function remove(key: string) {
    setImages((items) => {
      const removed = items.find((item) => item.key === key);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      const next = items.filter((item) => item.key !== key);
      // Keep exactly one cover image.
      if (removed?.isCover && next[0]) next[0] = { ...next[0], isCover: true };
      return next;
    });
  }

  function setCover(key: string) {
    setImages((items) => items.map((item) => ({ ...item, isCover: item.key === key })));
  }

  function moveTo(fromKey: string, toKey: string) {
    if (fromKey === toKey) return;
    setImages((items) => {
      const from = items.findIndex((item) => item.key === fromKey);
      const to = items.findIndex((item) => item.key === toKey);
      if (from < 0 || to < 0) return items;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      if (moved) next.splice(to, 0, moved);
      return next;
    });
  }

  function step(key: string, direction: -1 | 1) {
    const index = images.findIndex((item) => item.key === key);
    const target = images[index + direction];
    if (target) moveTo(key, target.key);
  }

  function onDropFiles(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files);
  }

  return (
    <fieldset className="card p-5">
      <legend className="px-1 text-base font-semibold">Images</legend>
      <p className="text-sm text-ink-600">
        JPG, PNG, WebP or AVIF, up to 10 MB each. The cover image is shown first in the catalogue.
      </p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDropFiles}
        className={`mt-4 rounded-lg border-2 border-dashed p-6 text-center ${
          dragOver ? "border-brand-600 bg-brand-50" : "border-ink-200 bg-ink-50/50"
        }`}
      >
        <p className="text-sm text-ink-700">Drag and drop images here, or</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-secondary btn-sm mt-2">
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {notice ? <p className="field-error">{notice}</p> : null}
      {errors.images ? <p className="field-error">{errors.images}</p> : null}

      <ul className="mt-4 space-y-3">
        {images.map((item, index) => {
          const altError = errors[`images.${index}.altText`] ?? errors[`images.${index}.publicId`];
          const preview = item.previewUrl ?? (item.publicId ? thumbUrl(item.publicId, 200) : undefined);
          return (
            <li
              key={item.key}
              draggable
              onDragStart={() => setDraggingKey(item.key)}
              onDragEnd={() => setDraggingKey(null)}
              onDragOver={(event) => {
                if (draggingKey) event.preventDefault();
              }}
              onDrop={(event) => {
                if (!draggingKey) return;
                event.preventDefault();
                event.stopPropagation();
                moveTo(draggingKey, item.key);
                setDraggingKey(null);
              }}
              className={`flex flex-col gap-3 rounded-lg border p-3 sm:flex-row ${
                draggingKey === item.key ? "border-brand-600 opacity-60" : "border-ink-100"
              }`}
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded bg-ink-100">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <p className="truncate text-xs text-ink-600">{item.fileName}</p>

                {item.status === "uploading" ? (
                  <div>
                    <div
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={item.progress}
                      aria-label={`Uploading ${item.fileName}`}
                      className="h-2 overflow-hidden rounded-full bg-ink-100"
                    >
                      <div className="h-full bg-brand-600 transition-all" style={{ width: `${item.progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-ink-600">Uploading... {item.progress}%</p>
                  </div>
                ) : null}

                {item.status === "error" ? <p className="field-error">{item.error ?? "Upload failed."}</p> : null}

                {item.status === "done" ? (
                  <div>
                    <input
                      aria-label={`Alt text for image ${index + 1}`}
                      value={item.altText}
                      onChange={(event) => patch(item.key, { altText: event.target.value })}
                      placeholder="Alt text: describe the image"
                      className={`input ${altError ? "input-error" : ""}`}
                    />
                    {altError ? <p className="field-error">{altError}</p> : null}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-2">
                  {item.status === "done" ? (
                    <label className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-800">
                      <input
                        type="radio"
                        name="cover-image"
                        checked={item.isCover}
                        onChange={() => setCover(item.key)}
                      />
                      Cover image
                    </label>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => step(item.key, -1)}
                    disabled={index === 0}
                    className="btn btn-secondary btn-sm"
                  >
                    Earlier
                  </button>
                  <button
                    type="button"
                    onClick={() => step(item.key, 1)}
                    disabled={index === images.length - 1}
                    className="btn btn-secondary btn-sm"
                  >
                    Later
                  </button>
                  <button type="button" onClick={() => remove(item.key)} className="btn btn-danger btn-sm">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {images.length > 1 ? <p className="mt-3 text-xs text-ink-600">Tip: you can also drag a row to reorder.</p> : null}
    </fieldset>
  );
}

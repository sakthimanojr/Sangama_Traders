"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { FieldErrors } from "@/lib/validation/errors";
import type { DocumentItem } from "./types";
import { altFromFileName, checkFile, uploadToCloudinary } from "./upload-client";

type Props = {
  documents: DocumentItem[];
  setDocuments: Dispatch<SetStateAction<DocumentItem[]>>;
  errors: FieldErrors;
};

const MAX_DOCUMENTS = 10;

export function DocumentsEditor({ documents, setDocuments, errors }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function patch(key: string, changes: Partial<DocumentItem>) {
    setDocuments((items) => items.map((item) => (item.key === key ? { ...item, ...changes } : item)));
  }

  async function startUpload(file: File, key: string) {
    try {
      const result = await uploadToCloudinary(file, "document", (progress) => patch(key, { progress }));
      patch(key, { publicId: result.publicId, url: result.url, status: "done", progress: 100 });
    } catch (error) {
      patch(key, { status: "error", error: error instanceof Error ? error.message : "Upload failed." });
    }
  }

  function addFiles(fileList: FileList) {
    const problems: string[] = [];
    const created: { file: File; item: DocumentItem }[] = [];

    for (const file of Array.from(fileList)) {
      const problem = checkFile(file, "document");
      if (problem) {
        problems.push(`${file.name}: ${problem}`);
      } else if (documents.length + created.length >= MAX_DOCUMENTS) {
        problems.push(`${file.name}: the limit is ${MAX_DOCUMENTS} documents.`);
      } else {
        created.push({
          file,
          item: {
            key: crypto.randomUUID(),
            fileName: file.name,
            status: "uploading",
            progress: 0,
            title: altFromFileName(file.name),
          },
        });
      }
    }

    setNotice(problems.length > 0 ? problems.join(" ") : null);
    if (created.length === 0) return;
    setDocuments((items) => [...items, ...created.map((entry) => entry.item)]);
    for (const { file, item } of created) void startUpload(file, item.key);
  }

  return (
    <fieldset className="card p-5">
      <legend className="px-1 text-base font-semibold">Documents (optional)</legend>
      <p className="text-sm text-ink-600">PDF files such as certificates or datasheets, up to 10 MB each.</p>

      <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-secondary btn-sm mt-3">
        Add PDF
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf"
        className="hidden"
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {notice ? <p className="field-error">{notice}</p> : null}
      {errors.documents ? <p className="field-error">{errors.documents}</p> : null}

      <ul className="mt-4 space-y-3">
        {documents.map((item, index) => {
          const titleError = errors[`documents.${index}.title`] ?? errors[`documents.${index}.publicId`];
          return (
            <li key={item.key} className="space-y-2 rounded-lg border border-ink-100 p-3">
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
                    aria-label={`Title for document ${index + 1}`}
                    value={item.title}
                    onChange={(event) => patch(item.key, { title: event.target.value })}
                    placeholder="Title shown to visitors, for example Phytosanitary certificate"
                    className={`input ${titleError ? "input-error" : ""}`}
                  />
                  {titleError ? <p className="field-error">{titleError}</p> : null}
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener" className="text-sm font-medium text-brand-600">
                    Open PDF
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => setDocuments((items) => items.filter((entry) => entry.key !== item.key))}
                  className="btn btn-danger btn-sm"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

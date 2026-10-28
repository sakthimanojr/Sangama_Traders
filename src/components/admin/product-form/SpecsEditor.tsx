"use client";

import type { Dispatch, SetStateAction } from "react";
import type { FieldErrors } from "@/lib/validation/errors";
import type { SpecRow } from "./types";

const SUGGESTIONS = ["Variety", "Grade", "Size", "Colour", "Origin", "Season", "Packaging", "Net weight", "Shelf life", "Minimum order"];

type Props = {
  specs: SpecRow[];
  setSpecs: Dispatch<SetStateAction<SpecRow[]>>;
  errors: FieldErrors;
};

export function SpecsEditor({ specs, setSpecs, errors }: Props) {
  function update(key: string, field: "label" | "value", value: string) {
    setSpecs((rows) => rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  function move(index: number, direction: -1 | 1) {
    setSpecs((rows) => {
      const target = index + direction;
      if (target < 0 || target >= rows.length) return rows;
      const next = [...rows];
      const [item] = next.splice(index, 1);
      if (item) next.splice(target, 0, item);
      return next;
    });
  }

  return (
    <fieldset className="card p-5">
      <legend className="px-1 text-base font-semibold">Specifications</legend>
      <p className="text-sm text-ink-600">Add your own rows, for example Variety, Grade, Size or Packaging.</p>

      <datalist id="spec-labels">
        {SUGGESTIONS.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>

      {errors.specs ? <p className="field-error">{errors.specs}</p> : null}

      <ul className="mt-4 space-y-3">
        {specs.map((row, index) => {
          const labelError = errors[`specs.${index}.label`];
          const valueError = errors[`specs.${index}.value`];
          return (
            <li key={row.key} className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
              <div>
                <input
                  aria-label={`Spec ${index + 1} label`}
                  list="spec-labels"
                  value={row.label}
                  onChange={(event) => update(row.key, "label", event.target.value)}
                  placeholder="Label"
                  className={`input ${labelError ? "input-error" : ""}`}
                />
                {labelError ? <p className="field-error">{labelError}</p> : null}
              </div>
              <div>
                <input
                  aria-label={`Spec ${index + 1} value`}
                  value={row.value}
                  onChange={(event) => update(row.key, "value", event.target.value)}
                  placeholder="Value"
                  className={`input ${valueError ? "input-error" : ""}`}
                />
                {valueError ? <p className="field-error">{valueError}</p> : null}
              </div>
              <div className="flex items-start gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move row up"
                  className="btn btn-secondary btn-sm"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === specs.length - 1}
                  aria-label="Move row down"
                  className="btn btn-secondary btn-sm"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => setSpecs((rows) => rows.filter((item) => item.key !== row.key))}
                  aria-label="Remove row"
                  className="btn btn-danger btn-sm"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => setSpecs((rows) => [...rows, { key: crypto.randomUUID(), label: "", value: "" }])}
        className="btn btn-secondary btn-sm mt-4"
      >
        Add spec row
      </button>
    </fieldset>
  );
}

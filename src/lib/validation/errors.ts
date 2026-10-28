export type FieldErrors = Record<string, string>;

type IssueLike = { path: readonly PropertyKey[]; message: string };

// Turns Zod issues into { "specs.0.label": "Label is required" }. The first message per field wins.
export function toFieldErrors(issues: readonly IssueLike[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

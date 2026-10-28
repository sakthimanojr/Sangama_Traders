"use client";

import { useEffect, useState, type FormEvent } from "react";

type Errors = Record<string, string>;
type Status = "idle" | "sending" | "sent";

type ResponseBody = { error?: string; errors?: Errors };

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [product, setProduct] = useState<{ slug: string; name: string } | null>(null);

  // The product comes from the link on the product page. Read after load so this page can stay static.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("product");
    if (slug) setProduct({ slug, name: params.get("name") ?? slug.replace(/-/g, " ") });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setErrors({});
    setFormError(null);

    const text = (name: string): string => String(data.get(name) ?? "");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: text("name"),
          email: text("email"),
          company: text("company"),
          message: text("message"),
          website: text("website"),
          productSlug: product?.slug,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as ResponseBody;

      if (response.ok) {
        form.reset();
        setStatus("sent");
        return;
      }
      setErrors(body.errors ?? {});
      setFormError(body.error ?? "Something went wrong. Please try again.");
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    }
    setStatus("idle");
  }

  if (status === "sent") {
    return (
      <div role="status" className="card border-brand-200 bg-brand-50 p-6">
        <h2 className="text-lg font-semibold">Thank you, your enquiry was sent.</h2>
        <p className="mt-2 text-sm text-ink-700">We will reply to the email address you gave us.</p>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-4 p-6">
      {product ? (
        <p className="rounded-md bg-ink-50 px-3 py-2 text-sm text-ink-800">
          Enquiry about: <strong>{product.name}</strong>
        </p>
      ) : null}

      {formError ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {formError}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="label">
          Your name
        </label>
        <input id="name" name="name" required autoComplete="name" className={`input ${errors.name ? "input-error" : ""}`} />
        {errors.name ? <p className="field-error">{errors.name}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`input ${errors.email ? "input-error" : ""}`}
          />
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
        </div>
        <div>
          <label htmlFor="company" className="label">
            Company (optional)
          </label>
          <input id="company" name="company" autoComplete="organization" className="input" />
          {errors.company ? <p className="field-error">{errors.company}</p> : null}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="label">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="Product, quantity, delivery location and any other details"
          className={`input ${errors.message ? "input-error" : ""}`}
        />
        {errors.message ? <p className="field-error">{errors.message}</p> : null}
      </div>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" disabled={sending} className="btn btn-primary">
        {sending ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}

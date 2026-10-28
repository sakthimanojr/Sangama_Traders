import Link from "next/link";
import { site } from "@/config/site";

// Gradient call-to-action band that sits just above the footer.
export function CtaBand() {
  const { cta, hero } = site;

  return (
    <section className="relative isolate mt-20 overflow-hidden text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hero.poster} alt="" width={1280} height={720} loading="lazy" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-deep-teal/90 via-deep-blue/90 to-deep-violet/90" />
      <div className="container-page py-16 text-center sm:py-20">
        <h2 className="text-4xl font-semibold uppercase tracking-wide text-white sm:text-5xl">{cta.headline}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/90">{cta.text}</p>
        <Link href="/contact" className="btn btn-pill btn-primary mt-8">
          {cta.button}
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-white" />
        </Link>
      </div>
    </section>
  );
}

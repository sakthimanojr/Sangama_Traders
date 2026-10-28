import type { Metadata } from "next";
import { CtaBand } from "@/components/public/CtaBand";
import { PageIntro } from "@/components/public/PageIntro";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "About us",
  description: `About ${site.name}: ${site.description}`,
  alternates: { canonical: "/about" },
};

const steps = [
  { title: "Source", text: "We buy directly from trusted growers, so you get produce at its freshest." },
  { title: "Inspect", text: "We check quality and freshness at every step, before anything is packed." },
  { title: "Pack", text: "Produce is graded and packed carefully to stay fresh all the way to you." },
  { title: "Deliver", text: "We deliver on schedule, in India and overseas, with clear communication." },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro title="About us">{site.about.headline}</PageIntro>

      <section className="container-page grid gap-10 py-14 lg:grid-cols-3">
        <div className="space-y-4 text-base leading-relaxed text-ink-800 lg:col-span-2">
          {site.about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <aside className="card h-fit p-6">
          <h2 className="text-2xl font-semibold uppercase tracking-wide">Markets we serve</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
            {site.targetMarkets.map((market) => (
              <li key={market}>{market}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="bg-ink-50">
        <div className="container-page py-14">
          <h2 className="text-4xl font-semibold uppercase tracking-wide">How we work</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="card p-5">
                <span className="text-sm font-bold text-deep-blue">0{index + 1}</span>
                <h3 className="mt-1 text-2xl font-semibold uppercase tracking-wide">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-700">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

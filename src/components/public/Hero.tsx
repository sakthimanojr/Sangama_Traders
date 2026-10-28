import Link from "next/link";
import { site } from "@/config/site";
import { HeroStage } from "./HeroStage";

export function Hero() {
  const { hero } = site;

  return (
    <section className="px-3 pb-3 sm:px-4">
      <HeroStage video={hero.video} poster={hero.poster} slides={hero.slides}>
        {/* Gradient overlays keep the text readable on the video and on every slide. */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-deep-navy/90 via-deep-navy/55 to-deep-teal/20" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 via-transparent to-deep-navy/30" />

        <div className="container-page relative flex min-h-[640px] flex-col justify-between gap-12 py-10 sm:min-h-[700px] sm:py-14">
          <div className="mt-auto max-w-3xl pt-16">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-white/90">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {hero.badge}
            </p>
            <h1 className="mt-4 text-5xl font-semibold uppercase leading-[1.05] tracking-wide text-white sm:text-6xl lg:text-7xl">
              {hero.headline}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{hero.paragraph}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-pill btn-primary">
                Request a Quote
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-white" />
              </Link>
              <Link href="/catalogue" className="btn btn-pill border border-white/40 text-white hover:bg-white/10">
                Browse products
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
            {hero.stats.map((stat, position) => (
              <div
                key={stat.label}
                className={`pr-4 ${position > 0 ? "sm:border-l sm:border-white/25 sm:pl-6" : ""} ${position % 2 === 1 ? "border-l border-white/25 pl-4 sm:pl-6" : ""}`}
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-4xl font-semibold text-white sm:text-5xl">{stat.value}</span>
                  <span className="mt-1 block text-sm text-white/75">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </HeroStage>
    </section>
  );
}

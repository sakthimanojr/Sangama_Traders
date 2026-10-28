// Centered section heading with a short rule underneath, used on the public pages.
export function SectionTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-semibold uppercase tracking-wide text-ink-950 sm:text-5xl">{title}</h2>
      {children ? <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-700 sm:text-base">{children}</p> : null}
      <div aria-hidden="true" className="mx-auto mt-6 h-0.5 w-24 bg-deep-blue" />
    </div>
  );
}

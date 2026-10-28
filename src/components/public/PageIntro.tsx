export function PageIntro({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className="bg-gradient-to-r from-deep-teal via-deep-blue to-deep-violet text-white">
      <div className="container-page py-14 sm:py-20">
        <h1 className="text-5xl font-semibold uppercase tracking-wide text-white sm:text-6xl">{title}</h1>
        <div aria-hidden="true" className="mt-5 h-0.5 w-20 bg-brand-500" />
        {children ? <div className="mt-5 max-w-2xl text-base text-white/90">{children}</div> : null}
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
};

export function PageHero({ eyebrow, title, description, actions, aside }: PageHeroProps) {
  return (
    <section className="hero-card overflow-hidden rounded-[32px] px-6 py-8 md:px-8">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
        <div>
          <p className="pill-accent inline-flex">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-5xl xl:text-6xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted md:text-lg">{description}</p>
          {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {aside ? <div className="xl:justify-self-end xl:self-stretch">{aside}</div> : null}
      </div>
    </section>
  );
}

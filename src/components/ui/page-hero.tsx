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
    <section className="hero-card rounded-[2rem] px-6 py-8 md:px-8 md:py-10">
      <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr] xl:items-end">
        <div>
          <p className="media-eyebrow">{eyebrow}</p>
          <h1 className="headline-section mt-5 max-w-5xl text-[#f7f4ed]">{title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">{description}</p>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {aside ? <div className="xl:self-stretch">{aside}</div> : null}
      </div>
    </section>
  );
}

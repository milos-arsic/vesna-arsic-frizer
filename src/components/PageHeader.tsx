type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700/90">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-stone-500 sm:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}

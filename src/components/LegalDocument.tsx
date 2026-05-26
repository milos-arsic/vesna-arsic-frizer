import type { LegalSection } from "@/lib/legal";

type LegalDocumentProps = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalDocument({
  title,
  lastUpdated,
  intro,
  sections,
}: LegalDocumentProps) {
  return (
    <article className="glass-card mx-auto max-w-3xl p-6 sm:p-10">
      <header className="mb-8 border-b border-stone-200/80 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          {lastUpdated}
        </p>
        <p className="mt-4 text-base leading-relaxed text-stone-600">{intro}</p>
      </header>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-stone-900">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-600 sm:text-base">
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul className="list-disc space-y-2 pl-5">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

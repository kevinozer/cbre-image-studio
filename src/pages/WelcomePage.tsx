import { ArrowRight, Lightbulb, ListChecks, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppNavBar } from '@/components/AppNavBar';
import { useT } from '@/i18n/useT';

/**
 * Welcome stránka - landing pro tuto app.
 *
 * Layout je sdílený napříč všemi CBRE Marketplace appkami:
 *  1. AppNavBar (s Enter Application vpravo)
 *  2. Hero v brand-primary (eyebrow + H1 + tagline + CTA)
 *  3. Sekce na světlém pozadí: Overview, How to use, Tips, Example
 *
 * Vlastní funkční obrazovka je na /app.
 *
 * Per-app obsah (název, tagline, overview, kroky, tipy, příklad) je v
 * translations.ts pod klíči `app.*` a `welcome.*`.
 * Logo je vlastní AppLogo SVG per app.
 */
// Žádný preview image — Image Studio nemá konkrétní "before" → "after" jako Home Vision.
// Místo toho zobrazíme dekorativní zelený gradient s ikonkou.

export function WelcomePage() {
  const t = useT();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <AppNavBar />

      {/* Hero */}
      <section className="bg-brand-primary text-white">
        <div className="max-w-container mx-auto px-4 md:px-6 py-16 grid grid-cols-1 gap-10">
          <div>
            <h1 className="mt-5 text-[48px] sm:text-[56px] font-extrabold leading-[1.05] tracking-tight">
              {t('app.title')}
            </h1>
            <p className="mt-3 text-[16px] text-white/85 max-w-2xl">{t('app.tagline')}</p>
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="mt-7 inline-flex items-center gap-2 h-12 px-5 rounded-input bg-surface-card text-brand-primary text-[14px] font-bold hover:bg-white/90 transition-colors shadow-card"
            >
              {t('common.enterApp')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <main className="flex-1 max-w-container mx-auto px-4 md:px-6 py-8 md:py-14 w-full grid grid-cols-1 md:grid-cols-2 gap-7">
        <section className="md:col-span-2 bg-surface-card rounded-card shadow-card border border-outline p-5 md:p-7">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0">
              <SectionTitle icon={<Sparkles className="w-4 h-4" />} title={t('welcome.overview.title')} />
              <p className="mt-3 text-[15px] text-ink-secondary leading-relaxed">
                {t('welcome.overview.body')}
              </p>
            </div>
            <div className="lg:w-[200px] w-full shrink-0">
              <div
                className="w-full h-[180px] rounded-card border border-outline shadow-card flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, #003F2D 0%, #1B5E40 50%, #003F2D 100%)',
                }}
              >
                <Sparkles className="w-10 h-10 text-white/70" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-card rounded-card shadow-card border border-outline p-5 md:p-7">
          <SectionTitle icon={<ListChecks className="w-4 h-4" />} title={t('welcome.howto.title')} />
          <ol className="mt-4 flex flex-col gap-4">
            {[1, 2, 3, 4].map((n) => (
              <Step
                key={n}
                index={n}
                title={t(`welcome.howto.step${n}.title`)}
                body={t(`welcome.howto.step${n}.body`)}
              />
            ))}
          </ol>
        </section>

        <section className="bg-surface-card rounded-card shadow-card border border-outline p-5 md:p-7">
          <SectionTitle icon={<Lightbulb className="w-4 h-4" />} title={t('welcome.tips.title')} />
          <ul className="mt-4 flex flex-col gap-3">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="flex items-start gap-3">
                <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
                <span className="text-[14px] text-ink-secondary leading-relaxed">
                  {t(`welcome.tips.t${n}`)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="md:col-span-2 bg-surface-card rounded-card shadow-card border border-outline p-5 md:p-7">
          <SectionTitle icon={<Sparkles className="w-4 h-4" />} title={t('welcome.example.title')} />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
            <ExampleCard label={t('welcome.example.input.label')} body={t('welcome.example.input.body')} />
            <div className="hidden md:flex items-center justify-center text-ink-muted">
              <ArrowRight className="w-5 h-5" />
            </div>
            <ExampleCard label={t('welcome.example.output.label')} body={t('welcome.example.output.body')} />
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-input bg-brand-primary text-white text-[14px] font-bold hover:bg-brand-primaryHover transition-colors shadow-card"
            >
              {t('common.enterApp')}
            </button>
          </div>
        </section>
      </main>

    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-brand-primary">
      <div className="w-7 h-7 rounded-full bg-brand-greenTint flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-[18px] font-bold">{title}</h2>
    </div>
  );
}

function Step({ index, title, body }: { index: number; title: string; body: string }) {
  return (
    <li className="flex items-start gap-4">
      <span className="shrink-0 w-8 h-8 rounded-full bg-brand-greenTint text-brand-primary inline-flex items-center justify-center font-bold text-[13px]">
        {index}
      </span>
      <div>
        <p className="text-[15px] font-semibold text-ink-primary">{title}</p>
        <p className="text-[14px] text-ink-secondary mt-1 leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

function ExampleCard({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-card bg-surface-muted border border-outline p-5">
      <p className="text-meta uppercase text-ink-muted">{label}</p>
      <p className="mt-2 text-[14px] text-ink-primary leading-relaxed">{body}</p>
    </div>
  );
}

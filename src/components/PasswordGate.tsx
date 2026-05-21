import { type FormEvent, useState } from 'react';
import { ArrowLeft, Globe } from 'lucide-react';

/**
 * Heslo gate před vstupem do aplikace.
 *
 * Heslo je v build-time env (VITE_APP_PASSWORD), default `cbre*`.
 * Renderuje se před AppProvider, takže nemá přístup k AppContext useT();
 * proto má vlastní jednoduchou detekci jazyka (navigator.language) + manuální toggle.
 */
const APP_PASSWORD = 'cbre*';  // hardcoded — ignoruje Cloud Run env var VITE_APP_PASSWORD
const APP_TITLE = 'CBRE - Image Studio';
const MARKETPLACE_URL =
  import.meta.env.VITE_MARKETPLACE_URL || 'https://cbrecz.netlify.app';

type Lang = 'cs' | 'en' | 'sk';

const T = {
  cs: {
    back: 'Zpět na Marketplace',
    intro: 'Pro vstup do aplikace zadej heslo.',
    placeholder: 'Heslo',
    err: 'Nesprávné heslo.',
    enter: 'Vstoupit',
  },
  en: {
    back: 'Back to Marketplace',
    intro: 'Enter the password to access the application.',
    placeholder: 'Password',
    err: 'Incorrect password.',
    enter: 'Enter',
  },
  sk: {
    back: 'Späť na Marketplace',
    intro: 'Pre vstup do aplikácie zadaj heslo.',
    placeholder: 'Heslo',
    err: 'Nesprávne heslo.',
    enter: 'Vstúpiť',
  },
} as const;

function detectLang(): Lang {
  // Default vždy EN. User si přepne přes Language switch.
  return 'en';
}

export interface PasswordGateProps {
  onSuccess: () => void;
}

export function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [lang, setLang] = useState<Lang>(detectLang());
  const t = T[lang];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
    }
  };

  const cycleLang = () => setLang((l) => (l === 'cs' ? 'en' : l === 'en' ? 'sk' : 'cs'));

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <header className="px-6 py-4 flex items-center justify-between">
        <a
          href={MARKETPLACE_URL}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-secondary hover:text-brand-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </a>
        <button
          type="button"
          onClick={cycleLang}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[12px] font-medium text-ink-secondary hover:bg-surface-muted transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="uppercase">{lang}</span>
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-surface-card rounded-card shadow-card p-5 md:p-8 border border-outline"
        >
          <img src="/cbre-logo-green.png" alt="CBRE" className="h-12 w-auto mx-auto" />
          <h2 className="mt-3 text-h3 font-bold text-brand-primary text-center">{APP_TITLE}</h2>
          <p className="mt-2 text-body text-ink-secondary text-center">{t.intro}</p>
          <div className="mt-6">
            <input
              type="password"
              placeholder={t.placeholder}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`w-full h-11 px-4 rounded-input bg-surface-card border text-body text-ink-primary placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-colors ${
                error ? 'border-red-500' : 'border-outline focus:border-brand-green'
              }`}
              autoFocus
            />
            {error ? <p className="mt-2 text-[13px] text-red-500">{t.err}</p> : null}
          </div>
          <button
            type="submit"
            className="mt-4 w-full h-11 rounded-input bg-brand-primary hover:bg-brand-primaryHover text-white font-bold transition-colors"
          >
            {t.enter}
          </button>
        </form>
      </div>
    </div>
  );
}
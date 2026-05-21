import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { LanguageDropdown } from '@/components/LanguageDropdown';
import { FeedbackButtons } from '@/components/feedback/FeedbackButtons';
import { useT } from '@/i18n/useT';

/**
 * Sjednocený NavBar napříč CBRE app stránkami (welcome + functional).
 *
 * Layout (dvouřádkový pro tagline):
 *   Row 1: [← Zpět] | CBRE logo                      [Dark][Lang][Nápady][!][Enter]
 *   Row 2 (sm+):    AI nástroj pro úpravy fotek nemovitostí…   ← tagline pod logem
 *
 * Tagline je v samostatném řádku, takže pravá tlačítka mají vždy dost prostoru
 * a nedeformují se ani na úzkých desktopech / širokých taboleta.
 */
const MARKETPLACE_URL =
  (import.meta as { env?: { VITE_MARKETPLACE_URL?: string } }).env?.VITE_MARKETPLACE_URL ||
  'https://cbrecz.netlify.app';

export function AppNavBar() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const isWelcome = location.pathname === '/';

  const handleBack = () => {
    if (isWelcome) {
      window.location.href = MARKETPLACE_URL;
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-brand-primary text-white">
      <div className="max-w-container mx-auto px-4 md:px-6">
        {/* === ROW 1 — hlavní navbar lišta === */}
        <div className="h-12 md:h-14 flex items-center gap-3 md:gap-4">
          {/* Back link */}
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 h-9 px-3 -ml-3 rounded-full text-[14px] font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.back')}</span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-white/15" />

          {/* CBRE wordmark — bez taglinu, ten je v Row 2 */}
          <a href="/" className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-shrink"><img src="/cbre-logo-white.png" alt="CBRE" className="h-5 md:h-6 w-auto" /><span className="text-white/60 font-medium">—</span><span className="font-semibold text-sm md:text-base text-white/95 truncate">{t('app.title').replace(/^CBRE\s+/, '')}</span></a>

          <div className="flex-1" />

          {/* Right controls */}
          {/* Desktop right cluster (>= md) */}
          <div className="hidden md:flex items-center gap-1">
            <DarkModeToggle variant="onDark" />
            <LanguageDropdown variant="onDark" />
            <FeedbackButtons appSlug="image-studio" />
          </div>

          {/* Enter Application button - jen na welcome */}
          {isWelcome ? (
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="hidden md:inline-flex items-center gap-2 h-9 px-4 rounded-input border border-white/35 hover:bg-white hover:text-brand-primary text-[13px] font-semibold transition-colors"
            >
              {t('common.enterApp')}
            </button>
          ) : null}
        </div>

      {/* Mobile right cluster - row 2 (< md), mobile-navbar-row */}
      <div className="md:hidden flex items-center justify-end gap-1 pb-2 -mt-1">
        <DarkModeToggle variant="onDark" />
            <LanguageDropdown variant="onDark" />
            <FeedbackButtons appSlug="image-studio" />
      </div>
      </div>
    </header>
  );
}

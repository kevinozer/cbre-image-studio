import { useState } from 'react';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { AlertModal } from './AlertModal';
import { useAppContext } from '@/state/AppContext';

/**
 * Drop-in cluster pro AppNavBar:
 *   - Velké pill tlačítko "Nápady na zlepšení" s žárovkou (text+ikona) — primární akce
 *   - Malé ikonové tlačítko vykřičníku v trojúhelníku — vedle pilulky, sekundární
 *
 * Předpokládá tmavou navbar (variant=onDark style).
 * Umístění v AppNavBar: za LanguageDropdown (vpravo).
 */
interface Props {
  appSlug: string;
}

const LABELS = {
  cs: { feedback: 'Nápady na zlepšení', alert: 'Hlášení problému' },
  en: { feedback: 'Improvement ideas', alert: 'Report a problem' },
  sk: { feedback: 'Nápady na zlepšenie', alert: 'Hlásenie problému' },
} as const;

export function FeedbackButtons({ appSlug }: Props) {
  const { language } = useAppContext();
  const labels = LABELS[language] || LABELS.cs;
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <>
      {/* Pill „Nápady na zlepšení" — text+ikona, primární */}
      <button
        type="button"
        onClick={() => setFeedbackOpen(true)}
        title={labels.feedback}
        aria-label={labels.feedback}
        className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium text-white/90 bg-white/10 hover:bg-white/20 transition-colors"
      >
        <Lightbulb className="w-4 h-4 text-amber-300" />
        <span>{labels.feedback}</span>
      </button>

      {/* Mobilní fallback – jen ikonka, kompaktní */}
      <button
        type="button"
        onClick={() => setFeedbackOpen(true)}
        title={labels.feedback}
        aria-label={labels.feedback}
        className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-amber-300 hover:bg-white/10 transition-colors"
      >
        <Lightbulb className="w-4 h-4" />
      </button>

      {/* Vykřičník v trojúhelníku — ikonové tlačítko vždy */}
      <button
        type="button"
        onClick={() => setAlertOpen(true)}
        title={labels.alert}
        aria-label={labels.alert}
        className="inline-flex items-center justify-center w-9 h-9 rounded-md text-red-300 hover:bg-white/10 transition-colors"
      >
        <AlertTriangle className="w-4 h-4" />
      </button>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} appSlug={appSlug} />
      <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} appSlug={appSlug} />
    </>
  );
}

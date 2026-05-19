import { useEffect, useRef, useState } from 'react';
import { X, Lightbulb, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/state/AppContext';

/**
 * Modal pro nápady na zlepšení (žárovka).
 * Posílá POST na Google Apps Script webhook (ainamiru účet),
 * zápis přistává v listu "Feedback" v Google Sheets.
 */
const WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbyr3NSzngTZ1AY6CPRc8zY54IrVXJg-ZNBYy9EHsNNsxTj8GmbFwGdr57O7q2uXZOQJCw/exec';

interface Props {
  open: boolean;
  onClose: () => void;
  appSlug: string;
}

const T = {
  cs: {
    title: 'Nápady na zlepšení',
    subtitle:
      'Pokud by Vám zde chyběla jakákoliv funkce, možnost nebo vás napadlo cokoliv, jak by se dala tato aplikace zlepšit, neváhejte nám napsat.',
    placeholder: 'Sem napiš svůj nápad…',
    send: 'Odeslat',
    sending: 'Odesílám…',
    sent: 'Děkujeme! Tvůj nápad byl odeslán.',
    error: 'Něco se pokazilo. Zkus to prosím znovu.',
    cancel: 'Zrušit',
    close: 'Zavřít',
  },
  en: {
    title: 'Improvement ideas',
    subtitle:
      'If a feature or option is missing here, or you have any idea how to improve this application, please let us know.',
    placeholder: 'Write your idea here…',
    send: 'Send',
    sending: 'Sending…',
    sent: 'Thanks! Your idea was sent.',
    error: 'Something went wrong. Please try again.',
    cancel: 'Cancel',
    close: 'Close',
  },
  sk: {
    title: 'Nápady na zlepšenie',
    subtitle:
      'Pokiaľ by Vám tu chýbala akákoľvek funkcia, možnosť alebo Vás napadlo čokoľvek, ako by sa dala táto aplikácia zlepšiť, neváhajte nám napísať.',
    placeholder: 'Sem napíš svoj nápad…',
    send: 'Odoslať',
    sending: 'Odosielam…',
    sent: 'Ďakujeme! Tvoj nápad bol odoslaný.',
    error: 'Niečo sa pokazilo. Skús to prosím znova.',
    cancel: 'Zrušiť',
    close: 'Zavrieť',
  },
} as const;

export function FeedbackModal({ open, onClose, appSlug }: Props) {
  const { language } = useAppContext();
  const t = T[language] || T.cs;
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) {
      setMessage('');
      setStatus('idle');
    } else {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;
    setStatus('sending');
    try {
      // no-cors → response neumíme číst, ale Apps Script zápis proběhne
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          type: 'feedback',
          appSlug,
          message: text,
          userAgent: navigator.userAgent,
        }),
      });
      setStatus('sent');
      setTimeout(() => onClose(), 1800);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        className="bg-surface-card dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="feedback-modal-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {t.title}
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 -mt-1 -mr-1 p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
            aria-label={t.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {status === 'sent' ? (
            <div className="flex flex-col items-center text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
              <p className="text-sm text-neutral-700 dark:text-neutral-300">{t.sent}</p>
            </div>
          ) : (
            <>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.placeholder}
                rows={5}
                disabled={status === 'sending'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-surface-card dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-none disabled:opacity-50"
              />
              {status === 'error' && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t.error}</span>
                </div>
              )}
            </>
          )}
        </div>

        {status !== 'sent' && (
          <div className="flex justify-end gap-2 p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={onClose}
              disabled={status === 'sending'}
              className="px-4 py-2 text-sm rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSend}
              disabled={status === 'sending' || !message.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === 'sending' ? t.sending : t.send}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

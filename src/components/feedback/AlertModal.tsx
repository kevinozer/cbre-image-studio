import { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/state/AppContext';

/**
 * Modal pro hlášení problému (vykřičník v trojúhelníku).
 * Posílá POST na Google Apps Script webhook (ainamiru účet),
 * zápis přistává v listu "Alerts" v Google Sheets.
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
    title: 'Hlášení problému',
    subtitle:
      'Pokud Vám aplikace nefungovala alespoň 5x a zkusili jste již i chvíli počkat, pošlete nám prosím upozornění.',
    placeholder: 'Co se stalo a co jste dělal/a, než to nastalo…',
    send: 'Odeslat upozornění',
    sending: 'Odesílám…',
    sent: 'Děkujeme! Upozornění bylo odesláno a brzy se na něj podíváme.',
    error: 'Něco se pokazilo. Zkus to prosím znovu.',
    cancel: 'Zrušit',
    close: 'Zavřít',
  },
  en: {
    title: 'Report a problem',
    subtitle:
      "If the application has not worked at least 5 times for you and you have already tried waiting a while, please send us an alert.",
    placeholder: 'What happened and what you were doing before it occurred…',
    send: 'Send alert',
    sending: 'Sending…',
    sent: 'Thanks! Your alert was sent and we will look into it soon.',
    error: 'Something went wrong. Please try again.',
    cancel: 'Cancel',
    close: 'Close',
  },
  sk: {
    title: 'Hlásenie problému',
    subtitle:
      'Ak Vám aplikácia nefungovala aspoň 5x a skúsili ste už aj chvíľu počkať, pošlite nám prosím upozornenie.',
    placeholder: 'Čo sa stalo a čo ste robil/a, než to nastalo…',
    send: 'Odoslať upozornenie',
    sending: 'Odosielam…',
    sent: 'Ďakujeme! Upozornenie bolo odoslané a čoskoro sa na to pozrieme.',
    error: 'Niečo sa pokazilo. Skús to prosím znova.',
    cancel: 'Zrušiť',
    close: 'Zavrieť',
  },
} as const;

export function AlertModal({ open, onClose, appSlug }: Props) {
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
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          type: 'alert',
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
      aria-labelledby="alert-modal-title"
    >
      <div
        className="bg-surface-card dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="alert-modal-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
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
                rows={6}
                disabled={status === 'sending'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-surface-card dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 resize-none disabled:opacity-50"
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
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

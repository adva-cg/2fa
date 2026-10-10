import { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { createT, type Language } from '@/utils/i18n';
import { WHATS_NEW } from '@/utils/update-notes';

interface UpdateModalProps {
  version: string;
  language: Language;
  onClose: () => void;
}

export function UpdateModal({ version, language, onClose }: UpdateModalProps) {
  const t = createT(language);
  const highlights = WHATS_NEW[version] || [];

  // Escape closes it, as it does every other dialog here. It counts as an
  // explicit dismissal for the same reason the corner button does: nothing
  // reaches this handler without the user asking for it.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* The changelog can run long, so it scrolls while the rating block and
          the dismiss button stay pinned — the rating is the whole reason this
          modal earns its interruption, and it must never be scrolled past. */}
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 max-w-sm w-full max-h-[92vh] shadow-xl flex flex-col overflow-hidden">
        <div className="px-5 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#4285F4]" size={20} />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('update.title')}</h2>
            <span className="ms-auto text-xs font-medium text-gray-400 dark:text-gray-500">v{version}</span>
            <button
              onClick={onClose}
              aria-label={t('update.gotIt')}
              className="-me-1.5 flex-shrink-0 rounded p-1 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 min-h-0">
          <ul className="space-y-2 pb-3">
            {highlights.map((key) => (
              <li key={key} className="flex items-start gap-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                <span className="text-[#4285F4] mt-0.5">&bull;</span>
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-gray-100 dark:border-dark-700">
          <button
            onClick={onClose}
            className="w-full font-medium text-sm py-2.5 rounded-lg transition-colors bg-[#4285F4] hover:bg-[#3367D6] text-white"
          >
            {t('update.gotIt')}
          </button>
        </div>
      </div>
    </div>
  );
}

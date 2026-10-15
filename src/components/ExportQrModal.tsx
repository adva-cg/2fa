import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ModalHeader } from './ModalHeader';
import type { Account } from '@/types';
import { accountLabel } from '@/utils/account-label';
import { createT, type Language } from '@/utils/i18n';
import { drawQR, type QRDrawing } from '@/utils/qr-encode';

interface ExportQrModalProps {
  account: Account;
  /** Already checked: a usable otpauth:// URL. Do not log it. */
  url: string;
  language: Language;
  onClose: () => void;
}

export function ExportQrModal({ account, url, language, onClose }: ExportQrModalProps) {
  const t = createT(language);
  const [qr, setQr] = useState<QRDrawing | null>(null);
  const [drawFailed, setDrawFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    drawQR(url)
      .then(drawing => {
        if (!cancelled) setQr(drawing);
      })
      .catch(err => {
        console.error('Could not draw a QR code for the account export', err);
        if (!cancelled) setDrawFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Could not copy the export link to the clipboard', err);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-dark-800"
      role="dialog"
      aria-modal="true"
      aria-label={t('exportQr.action')}
    >
      <ModalHeader title={accountLabel(account)} back={t('common.back')} onBack={onClose} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-md space-y-3 p-4">
          {qr && (
            <div className="mx-auto w-full max-w-[240px] rounded-lg bg-white p-3">
              <svg
                viewBox={`0 0 ${qr.size} ${qr.size}`}
                shapeRendering="crispEdges"
                className="block h-auto w-full text-black"
                role="img"
                aria-label={t('exportQr.scan')}
              >
                <path d={qr.path} fill="currentColor" />
              </svg>
            </div>
          )}
          {drawFailed && (
            <p className="text-xs text-red-600 dark:text-red-400">{t('exportQr.drawFailed')}</p>
          )}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">{t('exportQr.scan')}</p>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-colors ${
              copied ? 'bg-green-600' : 'bg-[#4285F4] hover:bg-[#3367D6]'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? t('exportQr.copied') : t('exportQr.copy')}
          </button>
        </div>
      </div>
    </div>
  );
}

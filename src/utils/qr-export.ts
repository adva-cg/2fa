import type { Account } from '@/types';
import { buildOTPAuthURL } from './qr-parser';
import { isUsableSecret } from './totp';

/**
 * The otpauth URL for one account, or null when the secret cannot produce a code.
 *
 * Null is the signal to toast and skip the QR. buildOTPAuthURL itself would
 * still emit a link, and a link that no authenticator can turn into a code is
 * worse than a refusal.
 *
 * Never log the return value: it carries the secret.
 */
export function otpauthExportURL(account: Pick<Account, 'name' | 'issuer' | 'secret' | 'algorithm' | 'digits' | 'period'>): string | null {
  if (!isUsableSecret(account.secret)) return null;
  return buildOTPAuthURL({
    name: account.name,
    issuer: account.issuer,
    secret: account.secret,
    algorithm: account.algorithm,
    digits: account.digits,
    period: account.period,
  });
}

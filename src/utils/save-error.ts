// What to tell the user when a write to the account list fails.
//
// Never the error's own text. Storage and vault errors are written for the
// console — "Refusing to save 12 accounts over 22 already stored" reached a
// user's screen verbatim, in English, in the middle of a Chinese interface, and
// told them nothing they could act on.

import type { createT } from './i18n';
import { VaultLockedError } from './vault';

export function saveErrorMessage(error: unknown, t: ReturnType<typeof createT>): string {
  if (error instanceof VaultLockedError) return t('restore.locked');
  return t('addAccount.errorSaveFailed');
}

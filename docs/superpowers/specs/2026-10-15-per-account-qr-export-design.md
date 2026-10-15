# Per-account QR export

## Goal

Let the user export **one** authenticator account as a scannable QR code that
carries the full secret (`otpauth://…`), so another authenticator can add the
same entry. Bulk file export stays “all accounts”; selective file export and
Share are out of scope.

## User flow

1. On an account card, a QR action sits beside Edit / Delete in every list view
   mode.
2. Clicking it opens a **confirm dialog first** (reuse `confirmDialog`): the QR
   contains the secret key; anyone who scans it can add this account. Confirm /
   Cancel. This blocks accidental exposure from a stray click.
3. On confirm, a full-screen modal opens with:
   - header (account label + Back),
   - large QR encoding the `otpauth://` URL,
   - **Copy link** button that puts that same URL on the clipboard.
4. If the secret cannot produce a usable URL, show an error toast and do not
   open the modal.

## Architecture

| Piece | Role |
| --- | --- |
| `ExportQrModal` (new) | Shows QR + copy. Patterned on `ShareModal` visuals (`ModalHeader`, SVG from `drawQR`), but no duration/password screen — content is ready immediately. |
| `AccountCard` | New optional `onExportQr` callback and button in all view modes (always available, unlike the unwired `onShare`). |
| `App.tsx` | `confirmDialog` → set exporting account → render `ExportQrModal`. Include the modal in `overlayOpen`. Close it when the vault locks or the account disappears from the list (same care as Edit). |
| `buildOTPAuthURL` | Already builds the URI used by plain-text export and import; reuse it so export and scan stay one format. |
| `drawQR` | Already draws share links; reuse for the `otpauth://` string. |
| i18n | New keys for confirm title/body/confirm label, modal title, copy / copied, QR draw failure, and “secret unusable” failure. Add to `i18n-keys.ts` and every locale file. |

## Error handling

- Unusable secret → toast; no modal.
- QR encoder fails → modal still opens; copy still works; short inline error
  instead of the image (same idea as Share when a link is too dense for a QR).
- Clipboard write fails → keep the button in the non-copied state; do not claim
  success.
- Never log the URL or secret.

## Testing

- Assert that a representative account round-trips: `buildOTPAuthURL` →
  `parseOTPAuthURL` / `parseQRCode` yields the same secret and parameters (the
  existing totp tests already cover much of this; add a focused case if the
  export path needs an explicit anchor).
- Assert `drawQR` returns a non-empty path for a typical `otpauth://` URL
  (similar to `test/share.test.ts`).

No UI E2E required for the first version.

## Out of scope

- Multi-select / selective bulk file export
- Google Authenticator–style migration QR batches
- Wiring or changing Share
- Downloading the QR as an image file

## Success criteria

- From one card, after an explicit confirm, the user can show a QR that another
  authenticator can scan to recreate the account.
- The same payload is available via Copy link as plain `otpauth://` text.
- Accidental clicks do not reveal the secret without confirmation.

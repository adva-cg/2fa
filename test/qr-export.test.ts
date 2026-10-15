import { check, scenario } from './harness';

const account = {
  name: 'ada@work.com',
  issuer: 'GitHub',
  secret: 'JBSWY3DPEHPK3PXP',
  algorithm: 'SHA1' as const,
  digits: 6,
  period: 30,
};

export async function run(): Promise<void> {
  const exp = await import('@/utils/qr-export');
  const qr = await import('@/utils/qr-parser');
  const encode = await import('@/utils/qr-encode');

  scenario('A usable account exports an otpauth URL another authenticator can read');
  const url = exp.otpauthExportURL(account);
  check('a URL is produced', typeof url === 'string' && url.startsWith('otpauth://totp/'));
  const parsed = url ? qr.parseQRCode(url) : null;
  const back = parsed?.accounts[0];
  check('the secret survives the round trip', back?.secret === 'JBSWY3DPEHPK3PXP', String(back?.secret));
  check('issuer and name survive', back?.issuer === 'GitHub' && back?.name === 'ada@work.com');
  check('algorithm, digits and period survive', back?.algorithm === 'SHA1' && back?.digits === 6 && back?.period === 30);

  scenario('A secret that cannot produce a code exports nothing');
  check('one character is refused', exp.otpauthExportURL({ ...account, secret: 'A' }) === null);
  check('a non-base32 secret is refused', exp.otpauthExportURL({ ...account, secret: 'not a key!' }) === null);

  scenario('A typical export URL still draws a QR code');
  const drawing = url ? await encode.drawQR(url) : null;
  check('the drawing is non-empty', (drawing?.path.length ?? 0) > 0, String(drawing?.size));
  check('it stays small enough to scan from a screen', (drawing?.size ?? 999) <= 89, String(drawing?.size));
}

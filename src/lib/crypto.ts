export function encryptText(text: string): string {
  return Buffer.from(text).toString('base64');
}

export function decryptText(encryptedText: string): string {
  return Buffer.from(encryptedText, 'base64').toString('utf-8');
}

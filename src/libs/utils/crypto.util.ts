export abstract class CryptoUtil {
  abstract encryptData(data: string): string;
  abstract decryptData(encryptedData: string): string;
}

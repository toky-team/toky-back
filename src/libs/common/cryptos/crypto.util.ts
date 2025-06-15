/**
 * 데이터 암호화 및 복호화 기능을 제공하는 인터페이스
 * 암호화 및 복호화 메서드를 제공합니다.
 */
export abstract class CryptoUtil {
  /**
   * 데이터를 암호화합니다.
   * @param data 암호화할 데이터
   * @returns 암호화된 데이터
   */
  abstract encryptData(data: string): string;

  /**
   * 암호화된 데이터를 복호화합니다.
   * @param encryptedData 암호화된 데이터
   * @returns 복호화된 데이터
   */
  abstract decryptData(encryptedData: string): string;
}

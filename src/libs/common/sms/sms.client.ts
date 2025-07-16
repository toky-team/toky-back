/**
 * SMS 발송을 위한 인터페이스
 * SMS 발송 메서드를 제공합니다.
 */
export abstract class SmsClient {
  /**
   * SMS를 발송합니다.
   *
   * @param to - 수신자 전화번호
   * @param message - 발송할 메시지 내용
   */
  abstract sendSms(to: string, message: string): Promise<void>;
}

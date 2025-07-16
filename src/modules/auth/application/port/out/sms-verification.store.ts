export abstract class SmsVerificationStore {
  /**
   * 회원가입용 SMS 인증번호를 생성하고 발송합니다.
   * @param phoneNumber 수신자 전화번호
   */
  abstract createVerificationCode(phoneNumber: string): Promise<void>;

  /**
   * SMS 인증번호를 검증합니다.
   * @param phoneNumber 전화번호
   * @param code 인증번호
   * @returns 검증 성공 여부
   */
  abstract verifyCode(phoneNumber: string, code: string): Promise<boolean>;

  /**
   * 인증 완료 여부를 확인합니다.
   * @param phoneNumber 전화번호
   * @returns 인증 완료 여부
   */
  abstract isVerified(phoneNumber: string): Promise<boolean>;
}

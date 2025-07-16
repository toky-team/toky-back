import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SmsClient } from '~/libs/common/sms/sms.client';

interface AligoSmsResponse {
  result_code: string;
  message: string;
  msg_id?: number;
  success_cnt?: number;
  error_cnt?: number;
  msg_type?: string;
}

@Injectable()
export class AligoSmsClient extends SmsClient {
  private readonly logger = new Logger(AligoSmsClient.name);
  private readonly apiKey: string;
  private readonly userId: string;
  private readonly sender: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.apiKey = this.configService.getOrThrow<string>('ALIGO_API_KEY');
    this.userId = this.configService.getOrThrow<string>('ALIGO_USER_ID');
    this.sender = this.configService.getOrThrow<string>('ALIGO_SENDER');
  }

  async sendSms(to: string, message: string): Promise<void> {
    const normalizedTo = this.normalizePhoneNumber(to);
    if (!normalizedTo) {
      this.logger.error(`Invalid phone number format: ${to}`);
      throw new BadRequestException('유효하지 않은 전화번호 형식입니다.');
    }

    const params = new URLSearchParams();
    params.append('key', this.apiKey);
    params.append('user_id', this.userId);
    params.append('sender', this.sender);
    params.append('receiver', normalizedTo);
    params.append('msg', message);

    this.logger.log(`SMS 발송 시작: ${to} → ${normalizedTo} (${message.length}자)`);

    try {
      const response = await fetch('https://apis.aligo.in/send/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`HTTP 요청 실패 (${response.status}): ${errorText}`);
        throw new InternalServerErrorException('SMS 서비스에 연결할 수 없습니다.');
      }

      const responseData: AligoSmsResponse = await response.json();

      if (responseData.result_code === '1') {
        this.logger.log(
          `SMS 발송 성공: ${normalizedTo}, msg_id: ${responseData.msg_id}, ` +
            `성공: ${responseData.success_cnt}, 실패: ${responseData.error_cnt}`
        );
      } else {
        // 에러 코드별 상세 메시지
        this.logger.error(`SMS 발송 실패 (${responseData.result_code}): ${responseData.message}`);
        throw new InternalServerErrorException(`SMS 전송 실패: ${responseData.message}`);
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException || error instanceof BadRequestException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`SMS 발송 중 예외 발생: ${message}`, stack);
      throw new InternalServerErrorException('SMS 전송 중 오류가 발생했습니다.');
    }
  }

  /**
   * 전화번호를 정규화합니다.
   * 다양한 형식을 받아서 01012345678 형태로 통일합니다.
   *
   * @param phoneNumber - 입력 전화번호
   * @returns 정규화된 전화번호 또는 null (유효하지 않은 경우)
   */
  private normalizePhoneNumber(phoneNumber: string): string | null {
    if (!phoneNumber) {
      return null;
    }

    // 1. 숫자만 추출
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // 2. 국가번호 처리 (+82, 82)
    let normalized = digitsOnly;
    if (normalized.startsWith('+82')) {
      normalized = '0' + normalized.substring(3);
    } else if (normalized.startsWith('82')) {
      normalized = '0' + normalized.substring(2);
    }

    // 3. 전화번호 형식 검증 및 정규화
    if (this.validateNormalizedPhoneNumber(normalized)) {
      return normalized;
    }

    return null;
  }

  /**
   * 정규화된 전화번호가 유효한 한국 휴대폰 번호인지 검증합니다.
   *
   * @param phoneNumber - 정규화된 전화번호
   * @returns 유효성 여부
   */
  private validateNormalizedPhoneNumber(phoneNumber: string): boolean {
    // 한국 휴대폰 번호 패턴
    // 010, 011, 016, 017, 018, 019로 시작하는 10-11자리 숫자
    const mobileRegex = /^01[016789]\d{7,8}$/;

    return mobileRegex.test(phoneNumber);
  }

  /**
   * Aligo API 에러 코드를 사용자 친화적 메시지로 변환
   */
  private getErrorMessage(resultCode: string, originalMessage: string): string {
    const errorMessages: Record<string, string> = {
      '-101': '인증 정보가 올바르지 않습니다.',
      '-102': '발신번호가 등록되지 않았습니다.',
      '-103': '잔액이 부족합니다.',
      '-104': '수신번호 형식이 올바르지 않습니다.',
      '-105': '메시지 내용이 올바르지 않습니다.',
      '-106': '발송 권한이 없습니다.',
      '-107': '일일 발송량을 초과했습니다.',
      '-108': '서비스가 중단되었습니다.',
      '-109': '중복 발송입니다.',
      '-110': '스팸 메시지로 분류되었습니다.',
    };

    return errorMessages[resultCode] || originalMessage || `알 수 없는 오류 (${resultCode})`;
  }
}

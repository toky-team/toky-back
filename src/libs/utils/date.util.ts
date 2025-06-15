import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

/**
 * 현재 KST 시간을 반환합니다.
 * @returns 현재 KST 시간
 */
const now = (): Dayjs => {
  return dayjs().tz();
};

/**
 * 주어진 날짜를 KST로 변환합니다.
 * @param d 변환할 날짜 (Dayjs, Date, 또는 문자열)
 * @returns KST로 변환된 날짜
 */
const toKst = (d: Dayjs | Date | string): Dayjs => {
  return dayjs(d).tz();
};

/**
 * 주어진 날짜를 지정된 형식으로 KST로 변환하여 문자열로 반환합니다.
 * @param d 변환할 날짜 (Dayjs, Date, 또는 문자열)
 * @param format 날짜 형식 (기본값: 'YYYY-MM-DD HH:mm:ss')
 * @returns KST로 변환된 날짜 문자열
 */
const formatDate = (d: Dayjs | Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  return toKst(d).format(format);
};

/**
 * 주어진 날짜를 UTC로 변환합니다.
 * @param d 변환할 날짜 (Dayjs, Date, 또는 문자열)
 * @returns UTC로 변환된 날짜 객체
 */
const toUtcDate = (d: Dayjs | Date | string): Date => {
  return toKst(d).utc().toDate();
};

/**
 * 다양한 날짜 관련 기능을 제공합니다.
 */
export const DateUtil = {
  now,
  toKst,
  formatDate,
  toUtcDate,
};

import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(isBetween);
dayjs.extend(timezone);
dayjs.extend(utc);

const KST_TIMEZONE = 'Asia/Seoul';

/**
 * 현재 KST 시간을 반환합니다.
 * @returns 현재 KST 시간
 */
const now = (): Dayjs => {
  return dayjs().tz(KST_TIMEZONE);
};

/**
 * 주어진 날짜를 KST로 변환합니다.
 * @param d 변환할 날짜 (Dayjs, Date, 또는 문자열)
 * @returns KST로 변환된 날짜
 */
const toKst = (d: Dayjs | Date | string): Dayjs => {
  return dayjs(d).tz(KST_TIMEZONE);
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
/**
 * 일반 Date 객체를 KST Dayjs로 변환합니다.
 * @param date Date 객체 (DB에서 가져온 UTC Date)
 * @returns KST Dayjs 객체
 */
const fromDate = (date: Date): Dayjs => {
  return dayjs(date).tz(KST_TIMEZONE);
};

/**
 * Dayjs 객체를 UTC Date로 변환합니다. (DB 저장용)
 * @param d Dayjs 객체
 * @returns UTC Date 객체
 */
const toDate = (d: Dayjs): Date => {
  return d.utc().toDate();
};

/**
 * 날짜를 지정된 형식의 문자열로 포맷합니다. (응답용)
 * @param d Dayjs 객체
 * @param format 포맷 문자열
 * @returns 포맷된 날짜 문자열 (KST 기준)
 */
const format = (d: Dayjs, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  return d.format(format);
};

export const DateUtil = {
  now,
  toKst,
  toUtcDate,
  fromDate,
  toDate,
  format,
};

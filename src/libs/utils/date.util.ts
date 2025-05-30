import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

// 현재 시간 (KST) 기준
const now = (): Dayjs => {
  return dayjs().tz();
};

// 어떤 날짜든 KST로 변환
const toKst = (d: Dayjs | Date | string): Dayjs => {
  return dayjs(d).tz();
};

// KST로 포맷
const formatDate = (d: Dayjs | Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  return toKst(d).format(format);
};

// UTC 저장용 Date 객체로 변환
const toUtcDate = (d: Dayjs | Date | string): Date => {
  return toKst(d).utc().toDate();
};

export const DateUtil = {
  now,
  toKst,
  formatDate,
  toUtcDate,
};

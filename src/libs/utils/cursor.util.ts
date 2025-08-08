import { BadRequestException } from '@nestjs/common';

import { CursorData } from '~/libs/interfaces/cursor-pagination/cursor.interface';

/**
 * 커서 문자열을 생성합니다.
 * @param data CursorData 객체
 * @returns 인코딩된 커서 문자열
 */
const createCursor = (data: CursorData): string => {
  try {
    const timestamp = data.createdAt.getTime();
    const compactFormat = `${timestamp}|${data.id}`;

    // Base64 인코딩
    return Buffer.from(compactFormat, 'utf-8').toString('base64');
  } catch (error) {
    throw new BadRequestException(`Failed to create cursor: ${error instanceof Error ? error.message : error}`);
  }
};

/**
 * 커서 문자열로부터 데이터를 파싱합니다.
 * @param cursor 커서 문자열
 * @returns CursorData 객체
 */
const parseCursorData = (cursor: string): CursorData => {
  try {
    const decodedString = Buffer.from(cursor, 'base64').toString('utf-8');
    const parts = decodedString.split('|');

    if (parts.length !== 2) {
      throw new BadRequestException('Invalid cursor format: Expected timestamp|id format');
    }

    const [timestampStr, id] = parts;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || timestamp <= 0) {
      throw new BadRequestException('Invalid cursor format: Invalid timestamp');
    }

    const createdAt = new Date(timestamp);
    if (isNaN(createdAt.getTime())) {
      throw new BadRequestException('Invalid cursor format: Invalid date');
    }

    if (!id || id.trim().length === 0) {
      throw new BadRequestException('Invalid cursor format: Empty ID');
    }

    return {
      id: id.trim(),
      createdAt,
    };
  } catch (error) {
    throw new BadRequestException(`Failed to parse cursor: ${error instanceof Error ? error.message : error}`);
  }
};

export const CursorUtil = {
  createCursor,
  parseCursorData,
};

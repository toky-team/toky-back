import { BadRequestException } from '@nestjs/common';

export interface BetHitCursorData {
  totalHitCount: number;
  id: string;
}

const createCursor = (data: BetHitCursorData): string => {
  try {
    const compactFormat = `${data.totalHitCount}|${data.id}`;
    return Buffer.from(compactFormat, 'utf-8').toString('base64');
  } catch (error) {
    throw new BadRequestException(`Failed to create cursor: ${error instanceof Error ? error.message : error}`);
  }
};

const parseCursorData = (cursor: string): BetHitCursorData => {
  try {
    const decodedString = Buffer.from(cursor, 'base64').toString('utf-8');
    const parts = decodedString.split('|');
    if (parts.length !== 2) {
      throw new BadRequestException(`Invalid cursor format`);
    }
    const [totalHitCount, id] = parts;
    return { totalHitCount: Number(totalHitCount), id };
  } catch (error) {
    throw new BadRequestException(`Failed to parse cursor: ${error instanceof Error ? error.message : error}`);
  }
};

export const BetHitCursorUtil = {
  createCursor,
  parseCursorData,
};

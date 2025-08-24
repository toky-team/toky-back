import { BadRequestException } from '@nestjs/common';

export interface ActivityCursorData {
  score: number;
  id: string;
}

const createCursor = (data: ActivityCursorData): string => {
  try {
    const compactFormat = `${data.score}|${data.id}`;
    return Buffer.from(compactFormat, 'utf-8').toString('base64');
  } catch (error) {
    throw new BadRequestException(`Failed to create cursor: ${error instanceof Error ? error.message : error}`);
  }
};

const parseCursorData = (cursor: string): ActivityCursorData => {
  try {
    const decodedString = Buffer.from(cursor, 'base64').toString('utf-8');
    const parts = decodedString.split('|');
    if (parts.length !== 2) {
      throw new BadRequestException(`Invalid cursor format`);
    }
    const [score, id] = parts;
    return { score: Number(score), id };
  } catch (error) {
    throw new BadRequestException(`Failed to parse cursor: ${error instanceof Error ? error.message : error}`);
  }
};

export const ActivityCursorUtil = {
  createCursor,
  parseCursorData,
};

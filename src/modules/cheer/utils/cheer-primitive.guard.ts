import { Sport } from '~/libs/enums/sport';
import { CheerPrimitives } from '~/modules/cheer/domain/model/cheer';

export function isCheerPrimitives(obj: unknown): obj is CheerPrimitives {
  if (typeof obj !== 'object' || obj === null) return false;

  const record = obj as Record<string, unknown>;

  const requiredProps = ['sport', 'KULike', 'YULike', 'createdAt', 'updatedAt'];
  if (!requiredProps.every((prop) => prop in record)) return false;

  return (
    typeof record.sport === 'string' &&
    Object.values(Sport).includes(record.sport as Sport) &&
    typeof record.KULike === 'number' &&
    typeof record.YULike === 'number' &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
}

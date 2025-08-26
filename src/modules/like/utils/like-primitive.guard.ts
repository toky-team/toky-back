import { Sport } from '~/libs/enums/sport';
import { LikePrimitives } from '~/modules/like/domain/model/like';

// LikePrimitives 타입을 검증하는 가드 함수
// PubSub을 통해 전송된 메시지는 JSON 직렬화/역직렬화로 인해 날짜가 문자열로 변환됨
export function isLikePrimitives(obj: unknown): obj is LikePrimitives {
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

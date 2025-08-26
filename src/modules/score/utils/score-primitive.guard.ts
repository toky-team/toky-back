import { Sport } from '~/libs/enums/sport';
import { MatchStatus } from '~/modules/score/domain/model/match-status.vo';
import { ScorePrimitives } from '~/modules/score/domain/model/score';

// ScorePrimitives 타입을 검증하는 가드 함수
// PubSub을 통해 전송된 메시지는 JSON 직렬화/역직렬화로 인해 날짜가 문자열로 변환됨
export function isScorePrimitive(obj: unknown): obj is ScorePrimitives {
  if (typeof obj !== 'object' || obj === null) return false;

  const record = obj as Record<string, unknown>;

  // 필수 속성 존재 여부 확인
  const requiredProps = ['sport', 'KUScore', 'YUScore', 'matchStatus', 'createdAt', 'updatedAt'];
  if (!requiredProps.every((prop) => prop in record)) return false;

  // 타입 검증
  return (
    typeof record.sport === 'string' &&
    Object.values(Sport).includes(record.sport as Sport) &&
    typeof record.KUScore === 'number' &&
    typeof record.YUScore === 'number' &&
    typeof record.matchStatus === 'string' &&
    Object.values(MatchStatus).includes(record.matchStatus as MatchStatus) &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
}

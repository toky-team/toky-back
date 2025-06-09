import { ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';

// ChatMessagePrimitives 타입을 검증하는 가드 함수
export function isChatMessagePrimitive(obj: unknown): obj is ChatMessagePrimitives {
  if (typeof obj !== 'object' || obj === null) return false;

  const record = obj as Record<string, unknown>;

  // 필수 속성 존재 여부 확인
  const requiredProps = ['id', 'content', 'userId', 'username', 'university', 'createdAt', 'updatedAt'];
  if (!requiredProps.every((prop) => prop in record)) return false;

  // 타입 검증
  return (
    typeof record.id === 'string' &&
    typeof record.content === 'string' &&
    typeof record.userId === 'string' &&
    typeof record.username === 'string' &&
    typeof record.university === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string' &&
    (record.deletedAt === null || typeof record.deletedAt === 'string')
  );
}

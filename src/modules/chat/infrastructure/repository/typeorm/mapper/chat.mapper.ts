import { DateUtil } from '~/libs/utils/date.util';
import { ChatMessage } from '~/modules/chat/domain/model/chat-message';
import { ChatMessageEntity } from '~/modules/chat/infrastructure/repository/typeorm/entity/chat-message.entity';

export class ChatMapper {
  static toEntity(doamin: ChatMessage): ChatMessageEntity {
    const primitives = doamin.toPrimitives();
    const entity = new ChatMessageEntity();
    entity.id = primitives.id;
    entity.content = primitives.content;
    entity.userId = primitives.userId;
    entity.username = primitives.username;
    entity.university = primitives.university;
    entity.sport = primitives.sport;
    entity.createdAt = DateUtil.toDate(primitives.createdAt);
    entity.updatedAt = DateUtil.toDate(primitives.updatedAt);
    entity.deletedAt = primitives.deletedAt ? DateUtil.toDate(primitives.deletedAt) : null;
    return entity;
  }

  static toDomain(entity: ChatMessageEntity): ChatMessage {
    return ChatMessage.reconstruct({
      id: entity.id,
      content: entity.content,
      userId: entity.userId,
      username: entity.username,
      university: entity.university,
      sport: entity.sport,
      createdAt: DateUtil.fromDate(entity.createdAt),
      updatedAt: DateUtil.fromDate(entity.updatedAt),
      deletedAt: entity.deletedAt ? DateUtil.fromDate(entity.deletedAt) : null,
    });
  }
}

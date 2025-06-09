import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';

import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { DateUtil } from '~/libs/utils/date.util';
import { ChatRepository } from '~/modules/chat/application/port/out/chat-repository.port';
import { ChatMessage } from '~/modules/chat/domain/model/chat-message';
import { ChatMessageEntity } from '~/modules/chat/infrastructure/repository/typeorm/entity/chat-message.entity';
import { ChatMapper } from '~/modules/chat/infrastructure/repository/typeorm/mapper/chat.mapper';

@Injectable()
export class TypeOrmChatRepository extends ChatRepository {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly ormRepo: Repository<ChatMessageEntity>
  ) {
    super();
  }

  async save(aggregate: ChatMessage): Promise<void> {
    const entity = ChatMapper.toEntity(aggregate);
    await this.ormRepo.save(entity);
  }

  async saveAll(aggregates: ChatMessage[]): Promise<void> {
    const entities = aggregates.map((chat) => ChatMapper.toEntity(chat));
    await this.ormRepo.save(entities);
  }

  async findById(id: string): Promise<ChatMessage | null> {
    const entity = await this.ormRepo.findOne({
      where: { id },
    });
    return entity ? ChatMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<ChatMessage[]> {
    const entities = await this.ormRepo.find();
    return entities.map((e) => ChatMapper.toDomain(e));
  }

  async findWithCursor(cursorParam: CursorPaginationParam): Promise<PaginatedResult<ChatMessage>> {
    const { limit, cursor, order = 'DESC' } = cursorParam;

    const messages = await this.ormRepo.find({
      // For HasNextPage
      take: limit + 1,
      order: {
        createdAt: order,
      },
      where: {
        createdAt: cursor
          ? order === 'DESC'
            ? LessThan(DateUtil.toUtcDate(cursor))
            : MoreThan(DateUtil.toUtcDate(cursor))
          : undefined,
      },
    });

    const hasNext = messages.length > limit;
    const sliced = hasNext ? messages.slice(0, limit) : messages;
    const items = sliced.map((e) => ChatMapper.toDomain(e));
    const nextCursor = hasNext ? DateUtil.formatDate(sliced[sliced.length - 1].createdAt) : null;

    return {
      items,
      nextCursor,
      hasNext,
    };
  }
}

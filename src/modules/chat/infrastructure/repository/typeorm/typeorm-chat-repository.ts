import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { CursorData } from '~/libs/interfaces/cursor-pagination/cursor.interface';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { CursorUtil } from '~/libs/utils/cursor.util';
import { ChatRepository } from '~/modules/chat/application/port/out/chat-repository.port';
import { ChatMessage } from '~/modules/chat/domain/model/chat-message';
import { ChatMessageEntity } from '~/modules/chat/infrastructure/repository/typeorm/entity/chat-message.entity';
import { ChatMapper } from '~/modules/chat/infrastructure/repository/typeorm/mapper/chat.mapper';

@Injectable()
export class TypeOrmChatRepository extends ChatRepository {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly ormRepo: Repository<ChatMessageEntity>,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  private async emitEvent(aggregate: ChatMessage): Promise<void> {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.emit(event);
    }
  }

  async save(aggregate: ChatMessage): Promise<void> {
    const entity = ChatMapper.toEntity(aggregate);
    await this.ormRepo.save(entity);
    await this.emitEvent(aggregate);
  }

  async saveAll(aggregates: ChatMessage[]): Promise<void> {
    const entities = aggregates.map((chat) => ChatMapper.toEntity(chat));
    await this.ormRepo.save(entities);
    await Promise.all(aggregates.map((chat) => this.emitEvent(chat)));
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

  async findBySportWithCursor(sport: Sport, cursorParam: CursorPaginationParam): Promise<PaginatedResult<ChatMessage>> {
    const { limit, cursor, order = 'DESC' } = cursorParam;

    let cursorData: CursorData | null = null;
    if (cursor) {
      try {
        const parsed = CursorUtil.parseCursorData(cursor);
        cursorData = parsed;
      } catch (error) {
        throw new DomainException(
          'CHAT',
          `커서값이 유효하지 않습니다: ${error instanceof Error ? error.message : error}`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const queryBuilder = this.ormRepo
      .createQueryBuilder('chat')
      .where('chat.sport = :sport', { sport })
      .orderBy('chat.createdAt', order)
      .addOrderBy('chat.id', order)
      .take(limit + 1);

    if (cursorData) {
      const { createdAt, id } = cursorData;

      if (order === 'DESC') {
        queryBuilder.andWhere('(chat.createdAt, chat.id) < (:cursorCreatedAt, :cursorId)', {
          cursorCreatedAt: createdAt,
          cursorId: id,
        });
      } else {
        queryBuilder.andWhere('(chat.createdAt, chat.id) > (:cursorCreatedAt, :cursorId)', {
          cursorCreatedAt: createdAt,
          cursorId: id,
        });
      }
    }

    const messages = await queryBuilder.getMany();

    const hasNext = messages.length > limit;
    const sliced = hasNext ? messages.slice(0, limit) : messages;
    let nextCursor: string | null = null;
    if (hasNext && sliced.length > 0) {
      const lastMessage = sliced[sliced.length - 1];
      const cursorData: CursorData = {
        id: lastMessage.id,
        createdAt: lastMessage.createdAt,
      };
      nextCursor = CursorUtil.createCursor(cursorData);
    }
    const items = sliced.map((e) => ChatMapper.toDomain(e));

    return {
      items,
      nextCursor,
      hasNext,
    };
  }
}

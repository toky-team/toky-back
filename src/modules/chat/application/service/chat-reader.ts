import { Injectable } from '@nestjs/common';

import { Sport } from '~/libs/enums/sport';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { ChatRepository } from '~/modules/chat/application/port/out/chat-repository.port';
import { ChatMessage } from '~/modules/chat/domain/model/chat-message';

@Injectable()
export class ChatReader {
  constructor(private readonly chatRepository: ChatRepository) {}

  async findById(chatId: string): Promise<ChatMessage | null> {
    return this.chatRepository.findById(chatId);
  }

  async findBySportWithCursor(sport: Sport, cursorParam: CursorPaginationParam): Promise<PaginatedResult<ChatMessage>> {
    const defaultParam: CursorPaginationParam = {
      limit: cursorParam.limit ?? 20,
      order: cursorParam.order ?? 'DESC',
      cursor: cursorParam.cursor,
    };
    return this.chatRepository.findBySportWithCursor(sport, defaultParam);
  }
}

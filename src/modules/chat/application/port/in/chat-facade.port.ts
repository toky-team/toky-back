import { Sport } from '~/libs/enums/sport';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';

export abstract class ChatFacade {
  abstract sendMessage(userId: string, message: string, sport: Sport): Promise<void>;
  abstract getMessagesBySportWithCursor(
    sport: Sport,
    param: CursorPaginationParam
  ): Promise<PaginatedResult<ChatMessagePrimitives>>;
  abstract setUserOnline(userId: string, sport: Sport): Promise<void>;
  abstract refreshUser(userId: string, sport: Sport): Promise<void>;
  abstract removeUser(userId: string, sport: Sport): Promise<void>;
  abstract getActiveUserCount(sport: Sport): Promise<number>;
  abstract deleteMessage(messageId: string): Promise<void>;
}

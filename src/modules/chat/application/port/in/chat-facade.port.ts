import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';

export abstract class ChatFacade {
  abstract sendMessage(userId: string, message: string): Promise<void>;
  abstract getMessagesByCursor(param: CursorPaginationParam): Promise<PaginatedResult<ChatMessagePrimitives>>;
  abstract setUserOnline(userId: string): Promise<void>;
  abstract refreshUser(userId: string): Promise<void>;
  abstract removeUser(userId: string): Promise<void>;
  abstract getActiveUserCount(): Promise<number>;
}

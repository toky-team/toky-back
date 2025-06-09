import { Repository } from '~/libs/core/application-core/repository.interface';
import { CursorPaginationParam } from '~/libs/interfaces/cursor-pagination/cursor-pagination-param.interface';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { ChatMessage } from '~/modules/chat/domain/model/chat-message';

export abstract class ChatRepository extends Repository<ChatMessage> {
  abstract findWithCursor(cursorParam: CursorPaginationParam): Promise<PaginatedResult<ChatMessage>>;
}

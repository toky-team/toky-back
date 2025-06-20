import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { PaginatedResult } from '~/libs/interfaces/cursor-pagination/pageinated-result.interface';
import { PaginatedResultDtoFactory } from '~/libs/interfaces/cursor-pagination/paginated-result.dto';
import { ChatFacade } from '~/modules/chat/application/port/in/chat-facade.port';
import { ChatMessageResponseDto } from '~/modules/chat/presentation/http/dto/chat-message.response.dto';
import { GetActiveUserCountRequestDto } from '~/modules/chat/presentation/http/dto/get-active-user-count.request.dto';
import { GetMessagesRequestDto } from '~/modules/chat/presentation/http/dto/get-messages.request.dto';

const ChatMessagePaginatedResultDto = PaginatedResultDtoFactory(
  ChatMessageResponseDto,
  'ChatMessagePaginatedResultDto'
);

@Controller('chat')
export class ChatController {
  constructor(private readonly chatFacade: ChatFacade) {}

  @Get('/messages')
  @ApiOperation({
    summary: '채팅 메시지 조회',
    description: '기존 채팅 메시지를 조회합니다. 커서기반 페이징을 지원합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '채팅 메시지 조회 성공',
    type: ChatMessagePaginatedResultDto,
  })
  @Public()
  async getMessages(
    @Query() getMessagesRequestDto: GetMessagesRequestDto
  ): Promise<PaginatedResult<ChatMessageResponseDto>> {
    const { cursor, limit, sport } = getMessagesRequestDto;
    const messages = await this.chatFacade.getMessagesBySportWithCursor(sport, {
      cursor,
      limit,
    });

    return {
      ...messages,
      items: messages.items.map((item) => ChatMessageResponseDto.fromPrimitives(item)),
    };
  }

  @Get('/active-user-count')
  @ApiOperation({
    summary: '활성 사용자 수 조회',
    description: '현재 활성화된 사용자 수를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '활성 사용자 수 조회 성공',
    type: Number,
  })
  @Public()
  async getActiveUserCount(@Query() dto: GetActiveUserCountRequestDto): Promise<number> {
    return this.chatFacade.getActiveUserCount(dto.sport);
  }
}

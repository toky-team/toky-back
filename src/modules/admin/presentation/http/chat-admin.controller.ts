import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { ChatInvoker } from '~/modules/chat/application/port/in/chat-invoker.port';

@Controller('/admin/chat')
@ApiTags('Chat')
@UseGuards(AdminGuard)
export class ChatAdminController {
  constructor(private readonly chatInvoker: ChatInvoker) {}

  @Delete('/:id')
  @ApiOperation({
    summary: '채팅 삭제',
    description: "특정 채팅 메시지를 삭제합니다. 'message_filtered' 이벤트를 발생시킵니다.",
  })
  @ApiResponse({
    status: 200,
    description: '채팅 메시지가 성공적으로 삭제되었습니다.',
  })
  async deleteChatMessage(@Param('id') messageId: string): Promise<void> {
    await this.chatInvoker.deleteMessage(messageId);
  }
}

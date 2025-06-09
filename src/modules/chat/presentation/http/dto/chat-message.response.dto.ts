import { ApiProperty } from '@nestjs/swagger';

import { ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';

export class ChatMessageResponseDto {
  @ApiProperty({
    description: '채팅 메시지 ID',
  })
  id: string;

  @ApiProperty({
    description: '채팅 메시지 내용',
  })
  content: string;

  @ApiProperty({
    description: '채팅 메시지 작성자 ID',
  })
  userId: string;

  @ApiProperty({
    description: '채팅 메시지 작성자 이름',
  })
  username: string;

  @ApiProperty({
    description: '채팅 메시지 작성자 소속 대학',
  })
  university: string;

  @ApiProperty({
    description: '채팅 메시지 작성 시간',
  })
  createdAt: string;

  static fromPrimitives(primitives: ChatMessagePrimitives): ChatMessageResponseDto {
    return {
      id: primitives.id,
      content: primitives.content,
      userId: primitives.userId,
      username: primitives.username,
      university: primitives.university,
      createdAt: primitives.createdAt,
    };
  }
}

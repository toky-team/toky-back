import { ApiProperty } from '@nestjs/swagger';

import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';

export class ChatMessageResponseDto {
  @ApiProperty({
    description: '채팅 메시지 ID',
  })
  id: string;

  @ApiProperty({
    description: '채팅 메시지 스포츠 종류',
    enum: Sport,
  })
  sport: Sport;

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
    enum: University,
  })
  university: University;

  @ApiProperty({
    description: '채팅 메시지 작성 시간',
  })
  createdAt: string;

  static fromPrimitives(primitives: ChatMessagePrimitives): ChatMessageResponseDto {
    return {
      id: primitives.id,
      sport: primitives.sport,
      content: primitives.content,
      userId: primitives.userId,
      username: primitives.username,
      university: primitives.university,
      createdAt: DateUtil.format(primitives.createdAt),
    };
  }
}

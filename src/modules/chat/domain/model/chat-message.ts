import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { DateUtil } from '~/libs/utils/date.util';
import { ChatCreatedEvent } from '~/modules/chat/domain/event/chat-created.event';
import { UserInfoVo } from '~/modules/chat/domain/model/user-info.vo';

export interface ChatMessagePrimitives {
  id: string;
  sport: Sport;
  content: string;
  userId: string;
  username: string;
  university: University;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  deletedAt: Dayjs | null;
}

type ChatDomainEvent = ChatCreatedEvent;

export class ChatMessage extends AggregateRoot<ChatMessagePrimitives, ChatDomainEvent> {
  private _content: string;
  private _userInfo: UserInfoVo;
  private _sport: Sport;

  private constructor(
    id: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null,
    sport: Sport,
    content: string,
    userInfo: UserInfoVo
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._content = content;
    this._userInfo = userInfo;
    this._sport = sport;
  }

  public static create(
    id: string,
    sport: Sport,
    content: string,
    userId: string,
    username: string,
    university: University
  ): ChatMessage {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('CHAT', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    const userInfo = UserInfoVo.create(userId, username, university);

    const chatMessage = new ChatMessage(id, now, now, null, sport, content, userInfo);

    chatMessage.addEvent(
      new ChatCreatedEvent(chatMessage.id, chatMessage.userInfo.userId, chatMessage.sport, chatMessage.content, now)
    );

    return chatMessage;
  }

  public get sport(): Sport {
    return this._sport;
  }

  public get content(): string {
    return this._content;
  }

  public get userInfo(): UserInfoVo {
    return this._userInfo;
  }

  public delete(): void {
    this.deletedAt = DateUtil.now();
    this.touch();
  }

  public toPrimitives(): ChatMessagePrimitives {
    return {
      id: this.id,
      sport: this.sport,
      content: this.content,
      userId: this.userInfo.userId,
      username: this.userInfo.username,
      university: this.userInfo.university,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  public static reconstruct(primitives: ChatMessagePrimitives): ChatMessage {
    const userInfoVo = UserInfoVo.create(primitives.userId, primitives.username, primitives.university);

    return new ChatMessage(
      primitives.id,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.deletedAt,
      primitives.sport,
      primitives.content,
      userInfoVo
    );
  }
}

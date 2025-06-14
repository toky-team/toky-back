import { HttpStatus } from '@nestjs/common';
import { Dayjs } from 'dayjs';

import { AggregateRoot } from '~/libs/core/domain-core/aggregate-root';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';
import { ChatCreatedEvent } from '~/modules/chat/domain/event/chat-created.event';
import { UserInfoVo } from '~/modules/chat/domain/model/user-info.vo';

export interface ChatMessagePrimitives {
  id: string;
  content: string;
  userId: string;
  username: string;
  university: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type ChatDomainEvent = ChatCreatedEvent;

export class ChatMessage extends AggregateRoot<ChatMessagePrimitives, ChatDomainEvent> {
  private _content: string;
  private _userInfo: UserInfoVo;

  private constructor(
    id: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null,
    content: string,
    userInfo: UserInfoVo
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._content = content;
    this._userInfo = userInfo;
  }

  public static create(id: string, content: string, userId: string, username: string, university: string): ChatMessage {
    const now = DateUtil.now();

    if (!id || id.trim().length === 0) {
      throw new DomainException('CHAT', 'ID는 비어있을 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    const userInfo = UserInfoVo.create(userId, username, university);

    const chatMessage = new ChatMessage(id, now, now, null, content, userInfo);

    chatMessage.addEvent(new ChatCreatedEvent(chatMessage.id, chatMessage.userInfo.userId, chatMessage.content, now));

    return chatMessage;
  }

  public get content(): string {
    return this._content;
  }

  public get userInfo(): UserInfoVo {
    return this._userInfo;
  }

  public toPrimitives(): ChatMessagePrimitives {
    return {
      id: this.id,
      content: this.content,
      userId: this.userInfo.userId,
      username: this.userInfo.username,
      university: this.userInfo.university,
      createdAt: DateUtil.formatDate(this.createdAt),
      updatedAt: DateUtil.formatDate(this.updatedAt),
      deletedAt: this.deletedAt ? DateUtil.formatDate(this.deletedAt) : null,
    };
  }

  public static reconstruct(primitives: ChatMessagePrimitives): ChatMessage {
    const userInfoVo = UserInfoVo.create(primitives.userId, primitives.username, primitives.university);

    return new ChatMessage(
      primitives.id,
      DateUtil.toKst(primitives.createdAt),
      DateUtil.toKst(primitives.updatedAt),
      primitives.deletedAt ? DateUtil.toKst(primitives.deletedAt) : null,
      primitives.content,
      userInfoVo
    );
  }
}

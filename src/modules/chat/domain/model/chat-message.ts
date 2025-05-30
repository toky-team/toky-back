import { Dayjs } from 'dayjs';

import { DomainEntity } from '~/libs/domain-core/domain-entity';
import { DateUtil } from '~/libs/utils/date.util';

export interface ChatMessagePrimitives {
  id: string;
  content: string;
  senderId: string;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  deletedAt?: Dayjs | null;
}

export class ChatMessage extends DomainEntity<ChatMessagePrimitives> {
  private _content: string;
  private _senderId: string;

  private constructor(
    id: string,
    createdAt: Dayjs,
    updatedAt: Dayjs,
    deletedAt: Dayjs | null,
    content: string,
    senderId: string
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this._content = content;
    this._senderId = senderId;
  }

  public static create(id: string, content: string, senderId: string): ChatMessage {
    const now = DateUtil.now();

    return new ChatMessage(id, now, now, null, content, senderId);
  }

  public get content(): string {
    return this._content;
  }

  public get senderId(): string {
    return this._senderId;
  }

  toPrimitives(): ChatMessagePrimitives {
    return {
      id: this.id,
      content: this.content,
      senderId: this.senderId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}

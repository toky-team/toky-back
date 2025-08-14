import { HttpStatus, Injectable } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { BetAnswerCreatedEvent } from '~/modules/bet-answer/domain/event/bet-answer-created.event';
import { BetAnswerScorePredictedEvent } from '~/modules/bet-answer/domain/event/bet-answer-score-predicted.event';
import { ChatCreatedEvent } from '~/modules/chat/domain/event/chat-created.event';
import { UserCreatedEvent } from '~/modules/user/domain/events/user-created.event';
import { UserInvitedEvent } from '~/modules/user/domain/events/user-invited.event';

@Injectable()
export class TicketRewardPolicy {
  private readonly policies: Map<string, TicketRewardInterface>;
  constructor() {
    this.policies = new Map();
    this.registerPolicy(UserCreatedEvent.eventName, 100, '회원가입 보상');
    this.registerPolicy(UserInvitedEvent.eventName, 50, '초대 보상');
    this.registerPolicy(BetAnswerCreatedEvent.eventName, 10, '베팅 참여 보상');
    this.registerPolicy(BetAnswerScorePredictedEvent.eventName, 5, '베팅 점수 예측 보상');
    this.registerPolicy(ChatCreatedEvent.eventName, 1, '채팅 메시지 작성 보상(테스트용)');
  }

  private registerPolicy(eventName: string, amount: number, reason: string): void {
    if (this.policies.has(eventName)) {
      throw new DomainException('TICKET', `이미 등록된 이벤트 이름입니다: ${eventName}`, HttpStatus.BAD_REQUEST);
    }
    this.policies.set(eventName, { amount, reason });
  }

  public getPolicy(eventName: string): TicketRewardInterface {
    const policy = this.policies.get(eventName);
    if (!policy) {
      throw new DomainException('TICKET', `등록되지 않은 이벤트 이름입니다: ${eventName}`, HttpStatus.NOT_FOUND);
    }
    return policy;
  }
}

interface TicketRewardInterface {
  amount: number;
  reason: string;
}

import { Injectable, OnModuleInit } from '@nestjs/common';

import { EventBus } from '~/libs/common/event-bus/event-bus.interface';
import { ActivityFacade } from '~/modules/activity/application/port/in/activity-facade.port';
import { FirstStageWinEvent } from '~/modules/attendance/domain/event/first-stage-win.event';
import { SecondStageWinEvent } from '~/modules/attendance/domain/event/second-stage-win.event';
import { MatchResultPredictedEvent } from '~/modules/bet-answer/domain/event/match-result-predicted.event';
import { PlayerPredictedEvent } from '~/modules/bet-answer/domain/event/player-predicted.event';
import { PlayerLikeEvent } from '~/modules/player-daily-like/domain/event/player-like.event';
import { UserInvitedEvent } from '~/modules/user/domain/events/user-invited.event';

@Injectable()
export class ActivityAddListener implements OnModuleInit {
  constructor(
    private readonly activityFacade: ActivityFacade,

    private readonly eventBus: EventBus
  ) {}

  async onModuleInit(): Promise<void> {
    // 승부예측 - 최대 250점(종목당 50점)
    // 경기 결과 예측 시 활동 점수 20점 부여
    await this.eventBus.subscribe(MatchResultPredictedEvent, async (event: MatchResultPredictedEvent) => {
      await this.activityFacade.addScore(event.userId, 20);
    });
    // 선수 예측 시 활동 점수 15점 부여
    await this.eventBus.subscribe(PlayerPredictedEvent, async (event: PlayerPredictedEvent) => {
      await this.activityFacade.addScore(event.userId, 15);
    });

    // 출석체크 - 최대 105점(3주간 21회 참여)
    // 1단계 통과 시 활동 점수 3점 부여
    await this.eventBus.subscribe(FirstStageWinEvent, async (event: FirstStageWinEvent) => {
      await this.activityFacade.addScore(event.userId, 3);
    });
    // 2단계 통과 시 활동 점수 2점 부여
    await this.eventBus.subscribe(SecondStageWinEvent, async (event: SecondStageWinEvent) => {
      await this.activityFacade.addScore(event.userId, 2);
    });

    // 친구초대 - 무제한 가능
    // 초대한 친구 가입 시 활동 점수 10점 부여
    await this.eventBus.subscribe(UserInvitedEvent, async (event: UserInvitedEvent) => {
      await this.activityFacade.addScore(event.invitedBy, 10);
    });

    // 선수 좋아요 - 최대 210점
    // 좋아요 1회당 1점 부여(도메인 정책 상 1일 10회 제한)
    await this.eventBus.subscribe(PlayerLikeEvent, async (event: PlayerLikeEvent) => {
      await this.activityFacade.addScore(event.userId, event.likeCount);
    });
  }
}

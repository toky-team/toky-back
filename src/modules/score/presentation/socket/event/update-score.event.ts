import { Sport } from '~/libs/enums/sport';
import { SocketEvent } from '~/libs/interfaces/socket-event/socket-event.interface';
import { MatchStatus } from '~/modules/score/domain/model/match-status.vo';
import { ScorePrimitives } from '~/modules/score/domain/model/score';

export class ScoreUpdateEvent implements SocketEvent {
  event = 'score_update' as const;
  payload: ScoreUpdateEventPayload = {
    score: {
      sport: Sport.FOOTBALL,
      KUScore: 10,
      YUScore: 2,
      matchStatus: MatchStatus.IN_PROGRESS,
      createdAt: '2025-06-09T12:34:56Z',
      updatedAt: '2025-06-09T12:34:56Z',
    },
  };
}

export interface ScoreUpdateEventPayload {
  score: ScorePrimitives;
}

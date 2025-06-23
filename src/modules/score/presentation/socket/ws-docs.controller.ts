import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { ConnectErrorEvent } from '~/libs/interfaces/socket-event/connect-error-event';
import { ErrorEvent } from '~/libs/interfaces/socket-event/error-event';
import { LeaveRoomEvent } from '~/modules/chat/presentation/socket/event/leave-room-event';
import { JoinRoomEvent } from '~/modules/score/presentation/socket/event/join-room-event';
import { ScoreUpdateEvent } from '~/modules/score/presentation/socket/event/update-score.event';

type ScoreWsEvent = JoinRoomEvent | LeaveRoomEvent | ScoreUpdateEvent | ErrorEvent | ConnectErrorEvent;

@ApiTags('ScoreWebSocket API')
@Controller('score-ws-docs')
export class ScoreWsDocsController {
  @Get()
  @ApiOperation({
    summary: 'WebSocket API 문서',
    description: `
# 점수 WebSocket API

## 연결 정보
- 기본 서버 URL: \`https://[도메인]\` 
- Socket.io 네임스페이스: \`score\`
- 연결 URL: \`https://[도메인]/score\`

## 연결 과정
1. 연결 실패 시 \`connect_error\` 이벤트가 발생합니다.

## 의존성
- Socket.io 클라이언트 라이브러리 필요 (v.4.8.1 이상)

## 다중 점수 지원
- 사용자는 동시에 여러 종목의 점수를 확인할 수 있습니다. 각 종목별로 \`join_room\`을 호출하여 원하는 모든 점수를 확인할 수 있습니다.


## 클라이언트 → 서버 이벤트

### join_room
점수를 구독하는 이벤트입니다. 해당 종목의 score_update 이벤트를 수신하기 시작합니다.
- 페이로드: \`{ sport: Sport }\`
- enum Sport {
  FOOTBALL = '축구',
  BASKETBALL = '농구',
  BASEBALL = '야구',
  RUGBY = '럭비',
  ICE_HOCKEY = '아이스하키'
  }
- 응답: 없음

### leave_room
점수에 대한 구독을 해제하는 이벤트입니다. 해당 종목의 score_update 이벤트 수신을 중지합니다.
- 페이로드: \`{ sport: Sport }\`
- Sport: \`enum [ 축구, 농구, 야구, 럭비, 아이스하키 ]\`
- 응답: 없음


## 서버 → 클라이언트 이벤트

### score_update
점수가 갱신되는 이벤트입니다. 해당 종목을 구독하는 모든 사용자에게 브로드캐스트됩니다.
- 페이로드: 
\`\`\`typescript
{
  score: {
    sport: Sport;
    KUScore: number;
    YUScore: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
}
\`\`\`
- Sport: \`enum [ 축구, 농구, 야구, 럭비, 아이스하키 ]\`
    
### error
메시지 처리 중 오류가 발생했을 때 전송되는 이벤트입니다.
- 페이로드: 
\`\`\`typescript
{
  message: {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path?: string;
    context?: string;
  }
}
\`\`\`
  
### connect_error
연결 중 인증 실패 등의 오류가 발생했을 때 전송되는 이벤트입니다. Socket.io 내부 구현에 따라 JSON 문자열화된 ExceptionFormat을 반환합니다.

- 페이로드:
\`\`\`typescript
{
  /**
   * JSON 문자열화된 ExceptionFormat
   * {
   *     timestamp: string;
   *     status: number;
   *     error: string;
   *     message: string;
   *     path?: string;
   *     context?: string;
   * }
   */
  message: string;
}
\`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: '이벤트 타입 및 예시를 포함합니다.',
    content: {
      'application/json': {
        examples: {
          'join room 요청': {
            value: new JoinRoomEvent(),
          },
          'leave room 요청': {
            value: new LeaveRoomEvent(),
          },
          'score_update 응답': {
            value: new ScoreUpdateEvent(),
          },
          'error 응답': {
            value: new ErrorEvent(),
          },
          'connect_error 응답': {
            value: new ConnectErrorEvent(),
          },
        },
      },
    },
  })
  @Public()
  getWsDocs(): ScoreWsEvent[] {
    return [
      new JoinRoomEvent(),
      new LeaveRoomEvent(),
      new ScoreUpdateEvent(),
      new ErrorEvent(),
      new ConnectErrorEvent(),
    ];
  }
}

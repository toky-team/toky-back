import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { ConnectErrorEvent } from '~/libs/interfaces/socket-event/connect-error-event';
import { ErrorEvent } from '~/libs/interfaces/socket-event/error-event';
import { AddCheerEvent } from '~/modules/cheer/presentation/socket/event/add-cheer-event';
import { JoinRoomEvent } from '~/modules/cheer/presentation/socket/event/join-room-event';
import { LeaveRoomEvent } from '~/modules/cheer/presentation/socket/event/leave-room-event';
import { CheerUpdateEvent } from '~/modules/cheer/presentation/socket/event/update-cheer.event';

type CheerWsEvent = JoinRoomEvent | LeaveRoomEvent | AddCheerEvent | CheerUpdateEvent | ErrorEvent | ConnectErrorEvent;

@ApiTags('CheerWebSocket API')
@Controller('cheer-ws-docs')
export class CheerWsDocsController {
  @Get()
  @ApiOperation({
    summary: 'WebSocket API 문서',
    description: `
# 응원 WebSocket API

## 연결 정보
- 기본 서버 URL: \`https://[도메인]\` 
- Socket.io 네임스페이스: \`cheer\`
- 연결 URL: \`https://[도메인]/cheer\`

## 연결 과정
1. 연결 실패 시 \`connect_error\` 이벤트가 발생합니다.

## 의존성
- Socket.io 클라이언트 라이브러리 필요 (v.4.8.1 이상)

## 다중 응원 지원
- 사용자는 동시에 여러 종목의 응원을 확인할 수 있습니다. 각 종목별로 \`join_room\`을 호출하여 원하는 모든 응원을 확인할 수 있습니다.


## 클라이언트 → 서버 이벤트

### join_room
응원을 구독하는 이벤트입니다. 해당 종목의 cheer_update 이벤트를 수신하기 시작합니다.
- 페이로드: \`{ sport: Sport }\`
- Sport: \`enum [ 축구, 농구, 야구, 럭비, 아이스하키 ]\`
- 응답: 없음

### leave_room
응원에 대한 구독을 해제하는 이벤트입니다. 해당 종목의 cheer_update 이벤트 수신을 중지합니다.
- 페이로드: \`{ sport: Sport }\`
- Sport: \`enum [ 축구, 농구, 야구, 럭비, 아이스하키 ]\`
- 응답: 없음

### add_cheer
응원을 추가하는 이벤트입니다. 특정 종목 및 학교에 대한 좋아요 수를 증가시킵니다.
- 페이로드: \`{ sport: Sport, university: University, likes: number }\`
- Sport: \`enum [ 축구, 농구, 야구, 럭비, 아이스하키 ]\`
- University: \`enum [ 고려대학교, 연세대학교 ]\`
- 응답: 없음 (성공 시 broadcast를 통해 \`cheer_update\` 이벤트로 전파)


## 서버 → 클라이언트 이벤트

### cheer_update
응원이 갱신되는 이벤트입니다. 해당 종목을 구독하는 모든 사용자에게 브로드캐스트됩니다.
- 페이로드: 
\`\`\`typescript
{
  cheer: {
    sport: Sport;
    KULike: number;
    YULike: number;
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
          'add cheer 요청': {
            value: new AddCheerEvent(),
          },
          'update cheer 응답': {
            value: new CheerUpdateEvent(),
          },
          'error 응답': {
            value: new ErrorEvent(),
          },
          'connect error 응답': {
            value: new ConnectErrorEvent(),
          },
        },
      },
    },
  })
  @Public()
  getWsDocs(): CheerWsEvent[] {
    return [
      new JoinRoomEvent(),
      new LeaveRoomEvent(),
      new AddCheerEvent(),
      new CheerUpdateEvent(),
      new ErrorEvent(),
      new ConnectErrorEvent(),
    ];
  }
}

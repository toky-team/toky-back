import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { ConnectErrorEvent } from '~/libs/interfaces/socket-event/connect-error-event';
import { ErrorEvent } from '~/libs/interfaces/socket-event/error-event';
import { JoinRoomEvent } from '~/modules/chat/presentation/socket/event/join-room-event';
import { LeaveRoomEvent } from '~/modules/chat/presentation/socket/event/leave-room-event';
import { PingEvent } from '~/modules/chat/presentation/socket/event/ping-event';
import { ReceiveMessageEvent } from '~/modules/chat/presentation/socket/event/receive-message-event';
import { SendMessageEvent } from '~/modules/chat/presentation/socket/event/sent-messave-event';

type ChatWsEvent =
  | PingEvent
  | JoinRoomEvent
  | LeaveRoomEvent
  | SendMessageEvent
  | ReceiveMessageEvent
  | ErrorEvent
  | ConnectErrorEvent;

@ApiTags('ChatWebSocket API')
@Controller('chat-ws-docs')
export class ChatWsDocsController {
  @Get()
  @ApiOperation({
    summary: 'WebSocket API 문서',
    description: `
# 채팅 WebSocket API

## 연결 정보
- 기본 서버 URL: \`https://[도메인]\` 
- Socket.io 네임스페이스: \`chat\`
- 연결 URL: \`https://[도메인]/chat\`
- 인증 방식: 쿠키 기반 (\`access-token\` JWT 토큰 필요)

## 연결 과정
1. 브라우저에 \`access-token\` 쿠키가 설정되어 있어야 합니다.
2. Socket.io 클라이언트로 연결 시 자동으로 쿠키가 전송됩니다.
3. 인증 실패 시 \`connect_error\` 이벤트가 발생합니다.

## 의존성
- Socket.io 클라이언트 라이브러리 필요 (v.4.8.1 이상)

## 다중 채팅방 지원
- 사용자는 동시에 여러 종목 채팅방에 참여할 수 있습니다. 각 종목별로 \`join_room\`을 호출하여 원하는 모든 채팅방에 참여할 수 있습니다.


## 클라이언트 → 서버 이벤트

### ping
사용자 세션을 갱신하는 이벤트입니다. 60초 이내에 주기적으로 호출하여 사용자 활성 상태를 유지합니다. 해당 정보는 활성화 유저 수 조회에 사용됩니다.
- 페이로드: 없음
- 응답: 없음

### join_room
채팅방에 참여하는 이벤트입니다. 해당 종목의 receive_message 이벤트를 수신하기 시작합니다.
- 페이로드: \`{ sport: Sport }\`
- Sport: \`enum [ 축구, 농구, 야구, 럭비, 아이스하키 ]\`
- 응답: 없음

### leave_room
채팅방에서 나가는 이벤트입니다. 해당 종목의 receive_message 이벤트 수신을 중지합니다.
- 페이로드: \`{ sport: Sport }\`
- Sport: \`enum [ 축구, 농구, 야구, 럭비, 아이스하키 ]\`
- 응답: 없음

### send_message
새 메시지를 전송합니다.
- 페이로드: \`{ message: string, sport: Sport }\`
- Sport: \`enum [ 축구, 농구, 야구, 럭비, 아이스하키 ]\`
- 응답: 없음 (성공 시 broadcast를 통해 \`receive_message\` 이벤트로 전파)


## 서버 → 클라이언트 이벤트

### receive_message
새 메시지를 수신하는 이벤트입니다. 채팅방의 모든 사용자에게 브로드캐스트됩니다.
- 페이로드: 
\`\`\`typescript
{
  message: {
    id: string;
    content: string;
    userId: string;
    username: string;
    university: University;
    sport: Sport;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }
}
\`\`\`
- Sport: \`enum [ 축구, 농구, 야구, 럭비, 아이스하키 ]\`
- University: \`enum [ 고려대학교, 연세대학교 ]\`
    
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
          // 클라이언트 → 서버 이벤트 예시
          'ping 요청': {
            value: new PingEvent(),
          },
          'join room 요청': {
            value: new JoinRoomEvent(),
          },
          'leave room 요청': {
            value: new LeaveRoomEvent(),
          },
          'send_message 요청': {
            value: new SendMessageEvent(),
          },

          // 서버 → 클라이언트 이벤트 예시
          'receive_message 응답': {
            value: new ReceiveMessageEvent(),
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
  getWsDocs(): ChatWsEvent[] {
    return [
      new PingEvent(),
      new JoinRoomEvent(),
      new LeaveRoomEvent(),
      new SendMessageEvent(),
      new ReceiveMessageEvent(),
      new ErrorEvent(),
      new ConnectErrorEvent(),
    ];
  }
}

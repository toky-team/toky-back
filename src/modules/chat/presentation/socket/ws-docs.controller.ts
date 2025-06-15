import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { ExceptionFormat } from '~/libs/interfaces/exception-format.interface';
import { ChatMessagePrimitives } from '~/modules/chat/domain/model/chat-message';

// WebSocket 이벤트 타입 정의 클래스
class PingEvent {
  event = 'ping' as const;
  payload: undefined = undefined;
}

class SendMessageEvent {
  event = 'send_message' as const;
  payload: { message: string } = { message: '안녕하세요! 반갑습니다.' };
}

class ReceiveMessageEvent {
  event = 'receive_message' as const;
  payload: { message: ChatMessagePrimitives } = {
    message: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      content: '안녕하세요! 반갑습니다.',
      userId: 'f4765f1d-a96d-4229-86eb-d5acdc55f645',
      username: '홍길동',
      university: '서울대학교',
      createdAt: '2025-06-09T12:34:56Z',
      updatedAt: '2025-06-09T12:34:56Z',
      deletedAt: null,
    } as ChatMessagePrimitives,
  };
}

class ErrorEvent {
  event = 'error' as const;
  payload: { message: ExceptionFormat } = {
    message: {
      timestamp: '2025-06-09T12:34:56Z',
      status: 400,
      error: 'Bad Request',
      message: '메시지 내용이 비어있습니다.',
      context: 'WebSocket',
    } as ExceptionFormat,
  };
}

class ConnectErrorEvent {
  event = 'connect_error' as const;
  payload: { message: string } = {
    message: JSON.stringify({
      timestamp: '2025-06-09T12:34:56Z',
      status: 401,
      error: 'Unauthorized',
      message: '토큰이 제공되지 않았습니다',
      context: 'WebSocket',
    } as ExceptionFormat),
  };
}

type ChatWsEvent = PingEvent | SendMessageEvent | ReceiveMessageEvent | ErrorEvent | ConnectErrorEvent;

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

## 클라이언트 → 서버 이벤트

### ping
사용자 세션을 갱신하는 이벤트입니다. 60초 이내에 주기적으로 호출하여 사용자 활성 상태를 유지합니다. 해당 정보는 활성화 유저 수 조회에 사용됩니다.
- 페이로드: 없음
- 응답: 없음

### send_message
새 메시지를 전송합니다.
- 페이로드: \`{ message: string }\`
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
    university: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    }
    }
    \`\`\`
    
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
      new SendMessageEvent(),
      new ReceiveMessageEvent(),
      new ErrorEvent(),
      new ConnectErrorEvent(),
    ];
  }
}

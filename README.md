# TOKY-BACK

## Description
정기전 승부예측 서비스 `TOKY`의 백엔드 레포지토리입니다.

## Project setup

```bash
$ yarn install
```
## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Deploy

개발 서버와 운영 서버를 별도로 관리합니다.

### Dev Server
`deploy.yml` 스크립트를 통해 빌드 및 배포됩니다.

### Prod Server
해당 레포에서는 `ci-build-push.yml` 스크립트를 통해 Nest 서버 애플리케이션의 도커 이미지 생성 및 PUSH 의 책임만을 갖습니다. 이후 toky-infra 레포에서 해당 이미지를 활용한 운영 서버의 구축을 담당합니다.


## Architecture

본 프로젝트는 DDD 설계를 기반으로 하며, Hexagonal Architecture의 개념을 참고해 각 계층을 분리하였습니다. 또한 다중 인스턴스 환경을 고려한 확장가능한 구조로 설계되었습니다.

각 도메인은 4개의 layer로 구성됩니다.
(본 프로젝트에서 도메인은 `src/modules/` 내의 폴더로 구분됩니다.)

### Domain Layer
- 해당 도메인 내에서 사용되는 객체(도메인 엔티티 및 값 객체)들을 정의합니다.
- 각 객체들의 속성과 따라야 할 규칙, 이를 검증하는 로직들을 구현합니다.
- 해당 도메인에서 발생하는 이벤트들을 정의합니다.
- 필요 시 해당 도메인에서 수행되어야 하는 기능(ex. 여러 객체들에 걸쳐서 수행되어야 하는 로직 등)을 구현합니다.

### Application Layer
- 해당 도메인이 수행 가능한 유즈케이스들을 정의합니다. (본 프로젝트에서는 개발의 편의를 위해 여러 유스케이스들을 `Facade`라는 하나의 파일에서 정의합니다.)
- In/Out 포트를 정의합니다.
  - In Port: 외부에서 내부 로직을 사용하기 위한 인터페이스 정의(ex. Facade 및 Invoker 인터페이스 등)
  - Out Port: 내부에서 외부 영역에 접근하기 위한 인터페이스 정의(ex. 레포지토리 인터페이스, 외부 API Client 등)
- In Port 의 어댑터(실제 구현체)를 구현합니다.
- 유즈케이스 처리에 필요한 서비스(ex. Domain 객체 Reader 및 Persister, JWT 토큰 생성 서비스, 채팅 메시지 pub/sub 서비스 등)을 구현합니다.

### Infrastructure Layer
- Out Port 의 어댑터(실제 구현체)를 구현합니다.
- 도메인 객체의 영속화를 위한 ORM Entity 및 변환을 위한 Mapper를 정의합니다.
- 외부 API(ex. 카카오 로그인 등)의 실제 호출을 구현합니다.

### Presentation Layer
- In Port 의 인터페이스에 의존하며 유즈케이스들을 클라이언트에 API로 드러냅니다.
- 요청 및 응답 구조를 정의하며 사용자 요청에 대한 검증을 수행합니다.
- API에 대한 문서를 작성합니다.

<br>

여러 도메인에 걸친 로직은 다음과 같이 수행합니다.

- 한 도메인에서 다른 도메인의 In Port 인터페이스에 의존하여 직접 로직 호출
  - 다른 도메인 호출의 응답을 이용해 동기적으로 추가로직을 처리해야할 때 수행합니다.
  - 해당 로직들이 서로 강하게 결합되어 한 트랜잭션에 포함되어야 하는 경우 수행합니다.
  - (본 프로젝트에서는 `Invoker`라는 파일로 도메인 간 참조를 추상화합니다.)

- Event 기반 비동기적 결합
  - 서로 완전히 독립적인 로직일 경우 수행합니다.
  - 로직의 실패가 다른 도메인 로직에 영향을 주지 말아야 할 경우 수행합니다.
  - (본 프로젝트에서는 추상화된 `EventBus`를 통해 이벤트기반 결합을 수행합니다.)

## Directory Structure

디렉토리 구조는 다음과 같습니다.

```bash
src/
├── modules/                        # 도메인별 모듈 모음
│   ├── auth/                       # 'auth' 도메인
│   │   ├── domain/                 # Domain Layer
│   │   │   ├── model/              # 도메인 엔티티 및 값 객체
│   │   │   ├── event/              # 도메인 이벤트
│   │   │   └── service/            # 도메인 서비스
│   │   │
│   │   ├── application/            # Application Layer
│   │   │   ├── port/
│   │   │   │   ├── in/             # In Port (Facade 인터페이스, Invoker 인터페이스)
│   │   │   │   └── out/            # Out Port (레포지토리, API 클라이언트 인터페이스)
│   │   │   ├── facade/             # 유스케이스 구현 (In Port Adapter)
│   │   │   ├── service/            # 유스케이스 처리에 필요한 서비스
│   │   │   └── dto/
│   │   │
│   │   ├── infrastructure/         # Infrastructure Layer
│   │   │   ├── client/             # 외부 API 호출 구현 (Out Port Adapter)
│   │   │   └── repository/typeorm  # DB 접근 레포지토리 구현 (Out Port Adapter)
│   │   │       ├── entity/         # ORM Entity
│   │   │       └── mapper/         # ORM ↔ 도메인 객체 매핑
│   │   │
│   │   └── presentation/           # Presentation Layer
│   │       ├── http/               # HTTP 요청 컨트롤러
│   │       │   └── dto/
│   │       └── socket/             # WebSocket gateway
│   └── other-domain/
│       └── ...                     # 동일한 구조
│
├── libs/                           # 공통 유틸리티
│   ├── common/                     # DI가 필요한 공통 서비스 등록 및 전역 설정 모듈
│   │   ├── id/                     # 고유 식별자 생성 인터페이스 및 구현체
│   │   ├── event-bus/              # Event 발행 및 구독 인터페이스 및 구현체
│   │   ├── pub-sub/                # Pub-Sub client 인터페이스 및 구현체
│   │   └── ...
│   │
│   ├── core/                       # 도메인 구조 규격화를 위한 추상클래스
│   │   ├── application-core/       # (repository interface...)
│   │   ├── domain-core/            # (domain entity, aggregate root, domain event...)
│   │   │   └── exceptions/         # (domain exception)
│   │   └── infrastructure-core/    # (base orm entity...)
│   │
│   ├── decorators/                 # 공통 데코레이터
│   ├── interfaces/                 # 공통 인터페이스
│   ├── utils/                      # 공통 유틸리티
│   └── ...
│
├── config/                         # 환경설정 (DB, 외부 API 등)
│   ├── typeorm.config.ts
│   └── ...
│
├── app.module.ts
└── main.ts                         # 애플리케이션 진입점
```

## Technology & Infra

NestJS, PostgreSQL, TypeORM, Redis, SocketIO, OAuth(Kakao), BullMQ

## API DOCS

로컬에서 실행 후 `http://localhost:{포트번호}/docs` 에서 확인 가능
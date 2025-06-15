import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public 데코레이터는 메서드가 공개 API임을 나타내는 데 사용됩니다.
 * 이 데코레이터를 사용하면 Swagger 문서에서 해당 메서드에 대한 보안 설정이 비활성화됩니다.
 * ApiOperation 데코레이터보다 나중에 적용되어야 합니다.
 */
export const Public = (): MethodDecorator => {
  return applyDecorators(
    // 메타데이터 설정: 전역 가드에서 이 메서드가 공개 API임을 인식할 수 있도록 합니다.
    SetMetadata(IS_PUBLIC_KEY, true),

    // Swagger에서 이 메서드에 대한 보안 설정을 비활성화
    ApiOperation({ security: [] }, { overrideExisting: false })
  );
};

import { SetMetadata } from '@nestjs/common';

export const ALLOW_NOT_REGISTERED_KEY = 'allowNotRegistered';

/**
 * AllowNotRegistered 데코레이터는 메서드가 등록되지 않은 사용자도 접근할 수 있도록 허용하는 데 사용됩니다.
 * 이 데코레이터를 사용하면 해당 메서드에 대한 접근 제어를 우회할 수 있습니다.
 */
export const AllowNotRegistered = (): MethodDecorator => SetMetadata(ALLOW_NOT_REGISTERED_KEY, true);

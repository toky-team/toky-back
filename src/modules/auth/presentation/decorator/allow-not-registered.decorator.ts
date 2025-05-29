import { SetMetadata } from '@nestjs/common';

export const ALLOW_NOT_REGISTERED_KEY = 'allowNotRegistered';
export const AllowNotRegistered = (): MethodDecorator => SetMetadata(ALLOW_NOT_REGISTERED_KEY, true);

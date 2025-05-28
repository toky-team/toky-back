import { SetMetadata } from '@nestjs/common';

export const AllowNotRegistered = (): MethodDecorator => SetMetadata('allowNotRegistered', true);

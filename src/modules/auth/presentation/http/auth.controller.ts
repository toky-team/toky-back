import { Body, Controller, Post } from '@nestjs/common';

import { LoginResultDto } from '~/modules/auth/application/dto/login-result.dto';
import { AuthFacade } from '~/modules/auth/application/port/in/auth-facade.port';

@Controller('auth')
export class AuthController {
  constructor(private readonly authFacade: AuthFacade) {}

  @Post('/kopas/login')
  async kopasLogin(@Body() body: { id: string; password: string }): Promise<LoginResultDto> {
    const { id, password } = body;
    return this.authFacade.kopasLogin(id, password);
  }
}

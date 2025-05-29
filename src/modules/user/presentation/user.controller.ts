import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AuthenticatedRequest } from '~/modules/auth/presentation/interface/authenticated-request.interface';
import { UserReader } from '~/modules/user/application/port/in/user-reader.port';
import { UserPrimitives } from '~/modules/user/domain/model/user';

@Controller('user')
export class UserController {
  constructor(private readonly userReader: UserReader) {}

  @Get('/')
  @ApiOperation({
    summary: '사용자 정보 조회',
    description: '로그인한 사용자의 정보를 조회합니다.',
  })
  async getUserInfo(@Req() req: AuthenticatedRequest): Promise<UserPrimitives> {
    const { user } = req;

    const userInfo = (await this.userReader.findById(user.userId))!.toPrimitives();
    return userInfo;
  }
}

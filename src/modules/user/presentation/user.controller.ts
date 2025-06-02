import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthenticatedRequest } from '~/modules/auth/presentation/interface/authenticated-request.interface';
import { UserFacade } from '~/modules/user/application/port/in/user-facade.port';
import { UserResponseDto } from '~/modules/user/presentation/dto/user.response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userFacade: UserFacade) {}

  @Get('/')
  @ApiOperation({
    summary: '사용자 정보 조회',
    description: '로그인한 사용자의 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    type: UserResponseDto,
  })
  async getUserInfo(@Req() req: AuthenticatedRequest): Promise<UserResponseDto> {
    const { user } = req;

    const userInfo = (await this.userFacade.getUserById(user.userId)).toPrimitives();
    return UserResponseDto.fromPrimitives(userInfo);
  }
}

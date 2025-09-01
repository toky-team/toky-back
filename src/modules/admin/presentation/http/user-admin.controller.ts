import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';
import { UserResponseDto } from '~/modules/user/presentation/http/dto/user.response.dto';

@Controller('admin/user')
@ApiTags('User')
@UseGuards(AdminGuard)
export class UserAdminController {
  constructor(private readonly userInvoker: UserInvoker) {}

  @Get('/')
  @ApiOperation({
    summary: '사용자 목록',
    description: '사용자 목록을 반환합니다.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: '사용자 이름으로 필터링',
  })
  @ApiResponse({
    type: [UserResponseDto],
  })
  async getUsers(@Query('name') name?: string): Promise<UserResponseDto[]> {
    const users = await this.userInvoker.getUsers(name);
    return users.map((user) => UserResponseDto.fromPrimitives(user));
  }
}

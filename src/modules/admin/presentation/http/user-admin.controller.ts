import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserSummaryResponseDto } from '~/modules/admin/presentation/http/dto/user-summary.response.dto';
import { AdminGuard } from '~/modules/admin/presentation/http/guard/admin.guard';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';

@Controller('admin/user')
@ApiTags('User')
@UseGuards(AdminGuard)
export class UserAdminController {
  constructor(private readonly userInvoker: UserInvoker) {}

  @Get('/summary')
  @ApiOperation({
    summary: '사용자 요약 정보',
    description: '사용자 정보 요약을 반환합니다.',
  })
  @ApiResponse({
    type: UserSummaryResponseDto,
  })
  async getUserSummary(): Promise<UserSummaryResponseDto> {
    const summary = await this.userInvoker.getUsersSummary();
    return UserSummaryResponseDto.fromResult(summary);
  }
}

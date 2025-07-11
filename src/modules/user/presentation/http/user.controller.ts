import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { Public } from '~/libs/decorators/public.decorator';
import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { UserFacade } from '~/modules/user/application/port/in/user-facade.port';
import { UserResponseDto } from '~/modules/user/presentation/http/dto/user.response.dto';

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

    const userInfo = await this.userFacade.getUserById(user.userId);
    return UserResponseDto.fromPrimitives(userInfo);
  }

  @Get('/name-exists')
  @ApiOperation({
    summary: '이름 중복 확인',
    description: '주어진 이름이 이미 존재하는지 확인합니다.',
  })
  @ApiQuery({
    name: 'name',
    description: '확인할 이름',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '이름 중복 확인 성공',
    type: Boolean,
  })
  @Public()
  async checkNameExists(@Query('name') name: string): Promise<boolean> {
    return this.userFacade.getNameExists(name);
  }

  @Get('/phone-number-exists')
  @ApiOperation({
    summary: '전화번호 중복 확인',
    description: '주어진 전화번호가 이미 존재하는지 확인합니다.',
  })
  @ApiQuery({
    name: 'phoneNumber',
    description: '확인할 전화번호',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '전화번호 중복 확인 성공',
    type: Boolean,
  })
  @Public()
  async checkPhoneNumberExists(@Query('phoneNumber') phoneNumber: string): Promise<boolean> {
    return this.userFacade.getPhoneNumberExists(phoneNumber);
  }
}

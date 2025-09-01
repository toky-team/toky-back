import { ApiProperty } from '@nestjs/swagger';

import { UsersSummaryDto } from '~/modules/user/application/dto/users-summary.dto';

class NewUsers {
  @ApiProperty({
    description: '오늘 신규 사용자 수',
  })
  today: number;

  @ApiProperty({
    description: '이번 주 신규 사용자 수',
  })
  thisWeek: number;

  @ApiProperty({
    description: '이번 달 신규 사용자 수',
  })
  thisMonth: number;
}

export class UserSummaryResponseDto {
  @ApiProperty({
    description: '총 사용자 수',
  })
  totalUsers: number;

  @ApiProperty({
    description: '고려대학교 사용자 수',
  })
  KUUsers: number;

  @ApiProperty({
    description: '연세대학교 사용자 수',
  })
  YUUsers: number;

  @ApiProperty({
    description: '신규 사용자 수',
  })
  newUsers: NewUsers;

  static fromResult(data: UsersSummaryDto): UserSummaryResponseDto {
    const response = new UserSummaryResponseDto();
    response.totalUsers = data.totalUsers;
    response.KUUsers = data.KUUsers;
    response.YUUsers = data.YUUsers;
    response.newUsers = {
      today: data.newUsers.today,
      thisWeek: data.newUsers.thisWeek,
      thisMonth: data.newUsers.thisMonth,
    };
    return response;
  }
}

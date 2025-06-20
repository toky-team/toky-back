import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';
import { University } from '~/libs/enums/university';

interface UserInfoProps {
  userId: string;
  username: string;
  university: University;
}

export class UserInfoVo extends ValueObject<UserInfoProps> {
  private constructor(props: UserInfoProps) {
    super(props);
  }

  public static create(userId: string, username: string, university: University): UserInfoVo {
    if (!userId || !username || !university) {
      throw new DomainException(
        'CHAT',
        'UserId, username, and university cannot be empty at chat message',
        HttpStatus.BAD_REQUEST
      );
    }

    return new UserInfoVo({ userId, username, university });
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get username(): string {
    return this.props.username;
  }

  public get university(): University {
    return this.props.university;
  }
}

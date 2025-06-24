import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AdminFacade } from '~/modules/admin/application/port/in/admin-facade.port';

@Injectable()
export class AdminFacadeImpl extends AdminFacade {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  isAdmin(userId: string): boolean {
    const adminIds =
      this.configService
        .get<string>('ADMIN_USER_IDS')
        ?.split(',')
        .map((id) => id.trim()) || [];
    return adminIds.includes(userId);
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AdminFacade } from '~/modules/admin/application/port/in/admin-facade.port';
import { DrawInvoker } from '~/modules/draw/application/port/in/draw-invoker.port';
import { UserInvoker } from '~/modules/user/application/port/in/user-invoker.port';
import { UserPrimitives } from '~/modules/user/domain/model/user';

@Injectable()
export class AdminFacadeImpl extends AdminFacade {
  constructor(
    private readonly configService: ConfigService,
    private readonly drawInvoker: DrawInvoker,
    private readonly userInvoker: UserInvoker
  ) {
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

  async raffleDraw(
    giftId: string,
    raffleCount: number,
    excludeDrawIds?: string[],
    includeAdmin?: boolean
  ): Promise<UserPrimitives[]> {
    // 응모 내역 로드
    let draws = await this.drawInvoker.getDraws(giftId);

    // 제외할 응모 내역 필터링
    if (excludeDrawIds && excludeDrawIds.length > 0) {
      const excludeSet = new Set(excludeDrawIds);
      draws = draws.filter((draw) => !excludeSet.has(draw.id));
    }

    // 관리자 포함 여부에 따라 당첨자 후보군 설정
    if (includeAdmin !== true) {
      const adminIds =
        this.configService
          .get<string>('ADMIN_USER_IDS')
          ?.split(',')
          .map((id) => id.trim()) || [];
      const adminSet = new Set(adminIds);
      draws = draws.filter((draw) => !adminSet.has(draw.userId));
    }

    // 사용자별 가중치 집계(응모 횟수)
    const weightMap: Map<string, number> = new Map();
    for (const draw of draws) {
      weightMap.set(draw.userId, (weightMap.get(draw.userId) ?? 0) + 1);
    }

    if (weightMap.size === 0 || raffleCount <= 0) {
      return [];
    }

    // 가중치 기반 추첨 (Efraimidis-Spirakis 알고리즘)
    // RNG 설정
    const rng = Math.random;

    // ES key 계산
    const scored: { userId: string; key: number }[] = [];
    for (const [userId, weight] of weightMap.entries()) {
      if (weight <= 0) continue;
      let u = 1 - rng();
      if (u <= 0) u = Number.MIN_VALUE;
      const key = Math.log(u) / weight;
      scored.push({ userId, key });
    }

    if (scored.length === 0) {
      return [];
    }

    // key 기준 내림차순 정렬
    scored.sort((a, b) => b.key - a.key);

    // 상위 N명 추출
    const pickCount = Math.min(raffleCount, scored.length);
    const winnerIds = scored.slice(0, pickCount).map((entry) => entry.userId);

    // 당첨자 정보 조회
    const winners = await Promise.all(
      winnerIds.map(async (userId) => {
        const user = await this.userInvoker.getUserById(userId);
        return user;
      })
    );
    return winners;
  }
}

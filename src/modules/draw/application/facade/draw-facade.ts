import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { DrawFacade } from '~/modules/draw/application/port/in/draw-facade.port';
import { DrawPersister } from '~/modules/draw/application/service/draw-persister';
import { DrawReader } from '~/modules/draw/application/service/draw-reader';
import { Draw } from '~/modules/draw/domain/model/draw';

@Injectable()
export class DrawFacadeImpl extends DrawFacade {
  constructor(
    private readonly drawReader: DrawReader,
    private readonly drawPersister: DrawPersister,

    private readonly idGenerator: IdGenerator
  ) {
    super();
  }

  @Transactional()
  async createDraw(giftId: string, userId: string, count: number): Promise<void> {
    const newDraws: Draw[] = [];
    for (let i = 0; i < count; i++) {
      const drawId = this.idGenerator.generateId();
      const draw = Draw.create(drawId, userId, giftId);
      newDraws.push(draw);
    }
    await this.drawPersister.saveAll(newDraws);
  }

  async countDraws(giftId: string, userId?: string): Promise<number> {
    const draws = await this.drawReader.findMany(giftId, userId);
    return draws.length;
  }
}

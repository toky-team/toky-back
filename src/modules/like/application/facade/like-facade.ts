import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { LikeFacade } from '~/modules/like/application/port/in/like-facade.port';
import { LikePersister } from '~/modules/like/application/service/like-persister';
import { LikePubSubService } from '~/modules/like/application/service/like-pub-sub.service';
import { LikeReader } from '~/modules/like/application/service/like-reader';
import { LikePrimitives } from '~/modules/like/domain/model/like';

@Injectable()
export class LikeFacadeImpl extends LikeFacade {
  constructor(
    private readonly likeReader: LikeReader,
    private readonly likePersister: LikePersister,
    private readonly likePubSubService: LikePubSubService
  ) {
    super();
  }

  async getLike(sport: Sport): Promise<LikePrimitives> {
    const like = await this.likeReader.findBySport(sport);
    if (!like) {
      throw new DomainException('LIKE', '좋아요 데이터를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    return like.toPrimitives();
  }

  @Transactional()
  async addLike(sport: Sport, university: University, likes: number): Promise<LikePrimitives> {
    const like = await this.likeReader.findBySport(sport);
    if (!like) {
      throw new DomainException('LIKE', '좋아요 데이터를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    like.addLikes(university, likes);
    await this.likePersister.save(like);

    await this.likePubSubService.publishLike(like.toPrimitives());

    return like.toPrimitives();
  }

  @Transactional()
  async resetLike(sport: Sport): Promise<LikePrimitives> {
    const like = await this.likeReader.findBySport(sport);
    if (!like) {
      throw new DomainException('LIKE', '좋아요 데이터를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    like.reset();
    await this.likePersister.save(like);

    await this.likePubSubService.publishLike(like.toPrimitives());

    return like.toPrimitives();
  }
}

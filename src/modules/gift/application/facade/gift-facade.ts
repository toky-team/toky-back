import { HttpStatus, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import { IdGenerator } from '~/libs/common/id/id-generator.interface';
import { StorageClient } from '~/libs/common/storage/storage.client';
import { toFile, validateImageFile } from '~/libs/common/storage/storage.util';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { DrawInvoker } from '~/modules/draw/application/port/in/draw-invoker.port';
import { GiftWithDrawInfoDto } from '~/modules/gift/application/dto/gift-with-draw-info.dto';
import { GiftFacade } from '~/modules/gift/application/port/in/gift-facade.port';
import { GiftPersister } from '~/modules/gift/application/service/gift-persister';
import { GiftReader } from '~/modules/gift/application/service/gift-reader';
import { Gift, GiftPrimitives } from '~/modules/gift/domain/model/gift';
import { TicketInvoker } from '~/modules/ticket/application/port/in/ticket-invoker.port';

@Injectable()
export class GiftFacadeImpl extends GiftFacade {
  private readonly GIFT_IMAGE_PATH = 'gift/image';

  constructor(
    private readonly giftReader: GiftReader,
    private readonly giftPersister: GiftPersister,

    private readonly drawInvoker: DrawInvoker,
    private readonly ticketInvoker: TicketInvoker,
    private readonly idGenerator: IdGenerator,
    private readonly storageClient: StorageClient
  ) {
    super();
  }

  @Transactional()
  async createGift(
    name: string,
    alias: string,
    requiredTicket: number,
    image: Express.Multer.File
  ): Promise<GiftPrimitives> {
    const imageFile = toFile(image);

    const imageValidation = validateImageFile(imageFile, {
      maxSizeMB: 5,
      strictValidation: true,
    });
    if (!imageValidation.isValid) {
      throw new DomainException('GIFT', '이미지 파일이 유효하지 않습니다.', HttpStatus.BAD_REQUEST);
    }

    const { url, key } = await this.storageClient.uploadFile(imageFile, this.GIFT_IMAGE_PATH);

    const gift = Gift.create(this.idGenerator.generateId(), name, alias, requiredTicket, url, key);
    await this.giftPersister.save(gift);
    return gift.toPrimitives();
  }

  @Transactional()
  async updateGift(
    id: string,
    name?: string,
    alias?: string,
    requiredTicket?: number,
    image?: Express.Multer.File
  ): Promise<GiftPrimitives> {
    const gift = await this.giftReader.findById(id);
    if (!gift) {
      throw new DomainException('GIFT', '경품 정보를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    if (name) {
      gift.changeName(name);
    }

    if (alias) {
      gift.changeAlias(alias);
    }

    if (requiredTicket) {
      gift.changeRequiredTicket(requiredTicket);
    }

    if (image) {
      const imageFile = toFile(image);

      const imageValidation = validateImageFile(imageFile, {
        maxSizeMB: 5,
        strictValidation: true,
      });
      if (!imageValidation.isValid) {
        throw new DomainException('GIFT', '이미지 파일이 유효하지 않습니다.', HttpStatus.BAD_REQUEST);
      }

      const { url, key } = await this.storageClient.changeFile(imageFile, this.GIFT_IMAGE_PATH, gift.giftImage.key);
      gift.changeGiftImage(url, key);
    }

    await this.giftPersister.save(gift);
    return gift.toPrimitives();
  }

  @Transactional()
  async deleteGift(id: string): Promise<void> {
    const gift = await this.giftReader.findById(id);
    if (!gift) {
      throw new DomainException('GIFT', '경품 정보를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    await this.storageClient.deleteFile(gift.giftImage.key);
    gift.delete();
    await this.giftPersister.save(gift);
  }

  async getGifts(userId?: string): Promise<GiftWithDrawInfoDto[]> {
    const gifts = await this.giftReader.findAll();
    gifts.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());
    return Promise.all(
      gifts.map(async (gift) => {
        const drawCountByUser = userId ? await this.drawInvoker.countDraws(gift.id, userId) : undefined;
        return GiftWithDrawInfoDto.fromPrimitives(gift.toPrimitives(), drawCountByUser);
      })
    );
  }

  @Transactional()
  async drawGift(userId: string, giftId: string, drawCount: number): Promise<void> {
    const gift = await this.giftReader.findById(giftId);
    if (!gift) {
      throw new DomainException('GIFT', '경품 정보를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    await this.ticketInvoker.decrementTicketCount(userId, drawCount, `경품 응모(${gift.alias})`);
    await this.drawInvoker.createDraw(giftId, userId, drawCount);
    gift.incrementDrawCount(drawCount);
    await this.giftPersister.save(gift);
  }
}

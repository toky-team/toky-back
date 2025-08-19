import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { PlayerPrimitives } from '~/modules/player/domain/model/player';

export class PlayerWithLikeInfoDto {
  id: string;
  name: string;
  university: University;
  sport: Sport;
  department: string;
  birth: string;
  height: number;
  weight: number;
  position: string;
  backNumber: number;
  careers: string[];
  imageUrl: string;
  imageKey: string;
  likeCount: number;
  isLikedByUser?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  public static fromPrimitives(primitives: PlayerPrimitives, isLikedByUser?: boolean): PlayerWithLikeInfoDto {
    const dto = new PlayerWithLikeInfoDto();
    dto.id = primitives.id;
    dto.name = primitives.name;
    dto.university = primitives.university;
    dto.sport = primitives.sport;
    dto.department = primitives.department;
    dto.birth = primitives.birth;
    dto.height = primitives.height;
    dto.weight = primitives.weight;
    dto.position = primitives.position;
    dto.backNumber = primitives.backNumber;
    dto.careers = primitives.careers;
    dto.imageUrl = primitives.imageUrl;
    dto.imageKey = primitives.imageKey;
    dto.likeCount = primitives.likeCount;
    dto.isLikedByUser = isLikedByUser;
    dto.createdAt = primitives.createdAt;
    dto.updatedAt = primitives.updatedAt;
    dto.deletedAt = primitives.deletedAt;

    return dto;
  }
}

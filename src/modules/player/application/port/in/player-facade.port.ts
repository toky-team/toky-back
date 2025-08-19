import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { PlayerWithLikeInfoDto } from '~/modules/player/application/dto/player-with-like-info.dto';
import { PlayerPrimitives } from '~/modules/player/domain/model/player';

export abstract class PlayerFacade {
  abstract createPlayer(
    name: string,
    university: University,
    sport: Sport,
    department: string,
    birth: string,
    height: number,
    weight: number,
    position: string,
    backNumber: number,
    careers: string[],
    image: Express.Multer.File
  ): Promise<PlayerPrimitives>;
  abstract updatePlayer(
    id: string,
    name?: string,
    university?: University,
    sport?: Sport,
    department?: string,
    birth?: string,
    height?: number,
    weight?: number,
    position?: string,
    backNumber?: number,
    careers?: string[],
    image?: Express.Multer.File
  ): Promise<PlayerPrimitives>;
  abstract deletePlayer(id: string): Promise<void>;
  abstract getPlayerById(id: string, userId?: string): Promise<PlayerWithLikeInfoDto>;
  abstract getPlayersByFilter(
    university?: University,
    sport?: Sport,
    position?: string,
    userId?: string
  ): Promise<PlayerWithLikeInfoDto[]>;
  abstract getPlayerByNameAndUniversityAndSport(
    name: string,
    university: University,
    sport: Sport
  ): Promise<PlayerPrimitives | null>;
  abstract likePlayer(userId: string, playerId: string): Promise<void>;
  abstract unlikePlayer(userId: string, playerId: string): Promise<void>;
  abstract isLikedByUser(userId: string, playerId: string): Promise<boolean>;
}

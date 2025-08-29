import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { PlayerPrimitives } from '~/modules/player/domain/model/player';

export abstract class PlayerFacade {
  abstract createPlayer(
    name: string,
    university: University,
    sport: Sport,
    department: string,
    birth: string | null,
    height: number | null,
    weight: number | null,
    position: string,
    backNumber: number,
    careers: string[],
    isPrimary: boolean,
    image: Express.Multer.File
  ): Promise<PlayerPrimitives>;
  abstract updatePlayer(
    id: string,
    name?: string,
    university?: University,
    sport?: Sport,
    department?: string,
    birth?: string | null,
    height?: number | null,
    weight?: number | null,
    position?: string,
    backNumber?: number,
    careers?: string[],
    isPrimary?: boolean,
    image?: Express.Multer.File
  ): Promise<PlayerPrimitives>;
  abstract deletePlayer(id: string): Promise<void>;
  abstract getPlayerById(id: string): Promise<PlayerPrimitives>;
  abstract getPlayersByFilter(university?: University, sport?: Sport, position?: string): Promise<PlayerPrimitives[]>;
  abstract getPlayerByNameAndUniversityAndSport(
    name: string,
    university: University,
    sport: Sport
  ): Promise<PlayerPrimitives | null>;
  abstract likePlayer(userId: string, playerId: string, count: number): Promise<PlayerPrimitives>;
}

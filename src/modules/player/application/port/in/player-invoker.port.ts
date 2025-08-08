import { Sport } from '~/libs/enums/sport';
import { University } from '~/libs/enums/university';
import { PlayerPrimitives } from '~/modules/player/domain/model/player';

export abstract class PlayerInvoker {
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
  abstract getPlayerByNameAndUniversityAndSport(
    name: string,
    university: University,
    sport: Sport
  ): Promise<PlayerPrimitives | null>;
}

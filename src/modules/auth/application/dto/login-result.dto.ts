import { TokenDto } from '~/modules/auth/application/dto/token.dto';

export class LoginResultDto {
  token: TokenDto;
  isRegistered: boolean;
}

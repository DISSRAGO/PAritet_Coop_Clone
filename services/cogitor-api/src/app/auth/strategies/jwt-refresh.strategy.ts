import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('SECURITY_JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: any): Promise<any> {
    return { userId: payload.id };
  }
}
/*public validate(payload: IJwtPayload): Promise<IUser> {
    return this.authService.getUserFromToken(payload);
  }*/

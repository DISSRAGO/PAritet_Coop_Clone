import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('SECURITY_ACCESS_JWT_SECRET'),
    });
  }

  /**
   * Returns user email and verification status contained in JWT payload.
   * @param payload Decoded JWT
   * @returns Object containing User data from JWT payload
   */
  async validate(payload: any): Promise<any> {
    return {
      id: payload.id,
    };
  }
}

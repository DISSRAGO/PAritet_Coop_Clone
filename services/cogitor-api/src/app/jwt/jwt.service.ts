import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtService as JS } from '@nestjs/jwt';
import { EJwtType } from './JWTType.enum';
import { InvalidTokenError } from './InvalidToken.error';
import jwt_decode from 'jwt-decode';
import { JWT_MODULE_OPTIONS } from './jwt.constants';
import { ITokenPair } from './ITokenPair.interface';

@Injectable()
export class JwtService extends JS {
  constructor(
    @Inject(JWT_MODULE_OPTIONS)
    private readonly jwtModuleOptions: JwtModuleOptions,
    private readonly configService: ConfigService,
  ) {
    super(jwtModuleOptions);
  }

  public getToken(payload: any, type: EJwtType): string {
    const expiresIn = this.configService.get(`SECURITY_${type}_TOKEN_EXPIRED`);
    const secret = this.configService.get(`SECURITY_${type}_JWT_SECRET`);
    return this.sign(
      { id: payload },
      {
        expiresIn: expiresIn,
        secret: secret,
      },
    );
  }

  public parseToken(token: string): any {
    try {
      //return this.verify(token);
      return jwt_decode(token);
    } catch (e) {
      throw new InvalidTokenError();
    }
  }

  public getTokenPair(payload: Partial<any>): ITokenPair {
    return {
      accessToken: this.getToken(payload, EJwtType.ACCESS),
      refreshToken: this.getToken(payload, EJwtType.REFRESH),
    };
  }
}

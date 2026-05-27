import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'login', passReqToCallback: true });
  }

  async validate(req: Request, login: string, password: string): Promise<any> {
    const ipAddress = req.ip;
    return this.authService.validateUser(ipAddress, login, password);
  }
}

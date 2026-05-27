import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as BS } from 'passport-http';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicStrategy extends PassportStrategy(BS) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req, username: string, password: string): Promise<any> {
    const ipAddress = req.ip;
    const user = await this.authService.validateUser(
      ipAddress,
      username,
      password,
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

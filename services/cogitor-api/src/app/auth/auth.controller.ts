import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { HttpExceptionFilter } from '../filters';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dtos/register.dto';
import { ConfirmDto } from './dtos/confirm.dto';
import { AppLogger } from '../logger/logger.service';
import { LoginSwagger, RegisterSwagger } from './auth.swagger';
import { AuthGuard } from '@nestjs/passport';
import { ITokenPair } from '../jwt/ITokenPair.interface';
import { LocalGuard } from './guards/LocalGuard';
import { PassportGuard } from './guards/PasswordGuard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authorization and authentication')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
  ) {}

  @LoginSwagger()
  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req: any): Promise<any> {
    const user = req.user;
    const tokens = await this.authService.getAuthTokens(user.id);
    await this.authService.setToken(user.id, tokens.accessToken);
    /**
     *   req
     *       .cookie('token', tokens.refreshToken, {
     *         httpOnly: true,
     *         domain: 'localhost',
     *         expires: new Date(
     *           Date.now() + this.configService.get(`SECURITY_REFRESH_TOKEN_EXPIRED`),
     *         ),
     *       })
     *       .send({
     *         status: 'success',
     *         data: { token: req.accessToken },
     *       });
     */
    return tokens;
  }

  @ApiOkResponse({
    description: 'Выход',
  })
  @ApiBearerAuth()
  @Post('/logout')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpExceptionFilter())
  async logout(@Headers('Authorization') token: string) {
    return this.authService.logout(token.substring(7));
  }

  @ApiBearerAuth()
  @Post('refresh')
  @UseGuards(PassportGuard('jwt-refresh'))
  public async refresh(@Req() userId: number): Promise<ITokenPair> {
    return this.authService.getAuthTokens({ id: userId });
  }

  @RegisterSwagger()
  @Post('/signUp')
  @UseFilters(new HttpExceptionFilter())
  async signUp(@Body() registerDto: RegisterDto) {
    console.log(registerDto);
    return this.authService.signUp(registerDto);
  }

  @ApiOkResponse({
    description: 'Подтверждение регистрации',
  })
  @Post('/confirm')
  @UseFilters(new HttpExceptionFilter())
  async registrationConfirm(@Body() confirmDto: ConfirmDto) {
    console.log(confirmDto);
    return this.authService.signUpConfirm(confirmDto);
  }

  @ApiOkResponse({
    description: 'Валидация логина',
  })
  @Post('/validate/login')
  @UseFilters(new HttpExceptionFilter())
  async validateLogin(@Body('login') login: string) {
    return this.authService.validateLogin(login);
  }

  @ApiOkResponse({
    description: 'Валидация почты',
  })
  @Post('/validate/email')
  @UseFilters(new HttpExceptionFilter())
  async validateEmail(@Body('email') email: string) {
    return this.authService.validateEmail(email);
  }

  @ApiOkResponse({
    description: 'Валидация телефона',
  })
  @Post('/validate/phone')
  @UseFilters(new HttpExceptionFilter())
  async validatePhone(@Body('phone') phone: string) {
    return this.authService.validatePhone(phone);
  }
}

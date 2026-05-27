import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { ConstantsModule } from '../constants/constants.module';
import { AppLoggerModule } from '../logger/logger.module';
import { JwtModule } from '../jwt/jwt.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConstantsModule,
    AppLoggerModule,
    PassportModule,
    JwtModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

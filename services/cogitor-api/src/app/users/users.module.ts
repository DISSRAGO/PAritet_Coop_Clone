import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './user.controller';
import { ConstantsModule } from '../constants/constants.module';
import { AppLoggerModule } from '../logger/logger.module';
import { UserConverter } from './UserConverter';
import { JwtModule } from '../jwt/jwt.module';

@Module({
  imports: [ConstantsModule, UserConverter, AppLoggerModule, JwtModule],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

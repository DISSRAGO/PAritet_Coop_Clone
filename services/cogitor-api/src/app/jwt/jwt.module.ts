import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { jwtModuleOptions } from './jwt.config';
import { JwtService } from './jwt.service';

@Module({
  imports: [ConfigModule],
  providers: [jwtModuleOptions, JwtService],
  exports: [JwtService],
})
export class JwtModule {}

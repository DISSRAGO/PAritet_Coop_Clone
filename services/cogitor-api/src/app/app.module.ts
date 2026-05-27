import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from '../environments/ConfigOptions';
import { PaymentModule } from './payment/PaymentModule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AddressModule } from './address/address.module';
import { AppController } from './app.controller';

console.log(join(__dirname, '..', '..', '..', 'data'));
@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    ServeStaticModule.forRoot({
      rootPath: process.env.FRONTEND_DIST,
      renderPath: '/*',
      exclude: ['/api*'],
    }),
    AddressModule,
    AuthModule,
    PaymentModule,
    JwtModule,
    UsersModule,
  ],
  controllers: [AppController]
})
export class AppModule {}

/**
 *   ServeStaticModule.forRoot({
 *       rootPath: process.env.FRONTEND_DIST,
 *       exclude: ['/services*'],
 *     }),
 */

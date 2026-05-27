import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { ConstantsModule } from '../constants/constants.module';
import { AppLoggerModule } from '../logger/logger.module';
import { AddressConverter } from "./address.converter";

@Module({
  imports: [ConstantsModule, AppLoggerModule],
  controllers: [AddressController],
  providers: [AddressService, AddressConverter],
})
export class AddressModule {}

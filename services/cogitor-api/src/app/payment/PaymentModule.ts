import { Module } from '@nestjs/common';
import { ConstantsModule } from '../constants/constants.module';
import { AppLoggerModule } from '../logger/logger.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [ConstantsModule, AppLoggerModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}

import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Headers, Query } from '@nestjs/common';
import { AppLogger } from '../logger/logger.service';
import { PaymentService } from './payment.service';
import { PaymentDescriptionDtoInput } from './dtos/input/payment.description.dto.input';
import { ConfirmTransferDto } from './dtos/input/confirm.transfer.dto';
import { PaymentActivationCodeDto } from './dtos/output/payment.activation.code.dto';
import { TypesPaymentTransferDto } from './dtos/output/types.payment.transfer.dto';

@ApiTags('payment')
@Controller('/payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly logger: AppLogger,
  ) {}

  @Get('/types')
  getTypesPaymentTransfer(
    @Headers('Authorization') token: string,
  ): Promise<TypesPaymentTransferDto> {
    return this.paymentService.getTypesPaymentTransfer(token.substring(7));
  }

  @Get('/transfer')
  step2(
    @Headers('Authorization') token: string,
    @Query() dto: PaymentDescriptionDtoInput,
  ): Promise<PaymentActivationCodeDto> {
    return this.paymentService.transferMoney(token.substring(7), dto);
  }

  @Get('/confirm')
  confirmMoneyTransfer(
    @Headers('Authorization') token: string,
    @Query() dto: ConfirmTransferDto,
  ) {
    return this.paymentService.confirmMoneyTransfer(token.substring(7), dto);
  }
}

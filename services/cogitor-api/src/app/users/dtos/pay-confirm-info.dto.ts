/**
 * Информация, нужная для подтверждения платежа
 */
export class PayConfirmInfoDto {
  activationRequestId: string;
  operationId: string;
  /**
   * код активации
   */
  activationCode: string;
}

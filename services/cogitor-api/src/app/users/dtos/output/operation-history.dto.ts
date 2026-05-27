/**
 * История операций
 */
import { AccountOperationDto } from './account-operation.dto';

export class OperationHistoryOutDto {
  /**
   * Список операций
   */
  operationList?: Array<AccountOperationDto>;
  /**
   * Сумма на начало периода
   */
  balanceBegin?: string;
  /**
   * Сумма на конец периода
   */
  balanceEnd?: string;
  totalDebit?: string;
  totalCredit?: string;
}

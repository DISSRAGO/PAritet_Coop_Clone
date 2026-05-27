import { CurrencyDto } from './currency.dto';

/**
 * Информация о счёте пользователя
 */
export class AccountDto {
  id: number;

  numberOfAccount: number;

  fullNumber: string;

  amount?: number;

  currency?: CurrencyDto;
}

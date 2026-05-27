import { Currency } from './Currency';

/**
 * Money
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Money {
  attributes: {
    ClientId: string;
    Amount: string;
  }
  /** CurrencyDto */
  Currency?: Currency;
}

import { Money } from './Money';

/**
 * AccountDto
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Account {
  attributes: {
    ClientId: string,
    Id: string;
    Number: string;
    FullNumber: string;
  },
  /** Money */
  Money?: Money;
}

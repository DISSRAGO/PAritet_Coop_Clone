import { Abonent } from './Abonent';

/**
 * CashBoxReport
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface CashBoxReport {
  /** Abonent */
  Abonent?: Abonent;
  /** s:double */
  BalanceFrom?: string;
  /** s:double */
  BalanceTo?: string;
  /** s:double */
  MoneyCustomerIn?: string;
  /** s:double */
  MoneyCustomerOut?: string;
  /** s:double */
  MoneyOut?: string;
}

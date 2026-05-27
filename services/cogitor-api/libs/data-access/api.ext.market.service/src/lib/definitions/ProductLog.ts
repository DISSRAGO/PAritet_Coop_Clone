import { AvailablePaymentList } from './AvailablePaymentList';

/**
 * ProductLog
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface ProductLog {
  /** s:date */
  Date?: string;
  /** ChangeList */
  ChangeList?: AvailablePaymentList;
  /** s:string */
  Author?: string;
}

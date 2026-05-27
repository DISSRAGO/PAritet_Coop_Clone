import { DeliveryAddress } from './DeliveryAddress';
import { PaymentType } from './PaymentType';
import { ActionList } from './ActionList';

/**
 * Invoice
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Invoice {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** s:string */
  Number?: string;
  /** s:string */
  Price?: string;
  /** Recipient */
  Recipient?: DeliveryAddress;
  /** Type */
  Type?: PaymentType;
  /** s:string */
  State?: string;
  /** s:string */
  StateCode?: string;
  /** ActionList */
  ActionList?: ActionList;
}

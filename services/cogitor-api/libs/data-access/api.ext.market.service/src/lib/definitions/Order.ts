import { DeliveryAddress } from './DeliveryAddress';
import { Tvt } from './Tvt';
import { ActionList } from './ActionList';
import { AvailablePaymentList } from './AvailablePaymentList';
import { SalesWareHouse } from './SalesWareHouse';

/**
 * Order
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Order {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** s:string */
  Number?: string;
  /** s:string */
  DateCreate?: string;
  /** DeliveryAddress */
  DeliveryAddress?: DeliveryAddress;
  /** Customer */
  Customer?: DeliveryAddress;
  /** Producer */
  Producer?: DeliveryAddress;
  /** Tvt */
  Tvt?: Tvt;
  /** s:string */
  State?: string;
  /** s:string */
  StateCode?: string;
  /** s:string */
  StateDate?: string;
  /** s:string */
  Price?: string;
  /** s:string */
  PriceShareholder?: string;
  /** s:string */
  DistributionPrice?: string;
  /** s:string */
  CustomerCode?: string;
  /** s:string */
  DeliveryDatePlan?: string;
  /** s:string */
  DeliveryDayCount?: string;
  /** ActionList */
  ActionList?: ActionList;
  /** AvailablePaymentList */
  AvailablePaymentList?: AvailablePaymentList;
  /** s:string */
  Description?: string;
  /** WareHouse */
  WareHouse?: SalesWareHouse;
  /** Cashier */
  Cashier?: DeliveryAddress;
  /** s:string */
  PaymentType?: string;
  /** s:double */
  PrePayedAmount?: string;
}

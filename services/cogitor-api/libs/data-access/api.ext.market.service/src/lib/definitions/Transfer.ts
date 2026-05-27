import { SalesWareHouse } from './SalesWareHouse';
import { Goods } from './Goods';
import { Abonent } from './Abonent';
import { Order } from './Order';

/**
 * Transfer
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Transfer {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** WareHouseFrom */
  WareHouseFrom?: SalesWareHouse;
  /** WareHouseTo */
  WareHouseTo?: SalesWareHouse;
  /** s:string */
  Date?: string;
  /** Goods */
  Goods?: Goods;
  /** s:string */
  Operation?: string;
  /** s:double */
  Count?: string;
  /** Abonent */
  Abonent?: Abonent;
  /** s:string */
  Description?: string;
  /** Order */
  Order?: Order;
}

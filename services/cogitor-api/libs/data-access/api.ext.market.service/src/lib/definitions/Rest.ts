import { SalesWareHouse } from './SalesWareHouse';
import { Goods } from './Goods';

/**
 * Rest
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Rest {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** WareHouse */
  WareHouse?: SalesWareHouse;
  /** Goods */
  Goods?: Goods;
  /** s:double */
  RestCount?: string;
  /** s:double */
  ReservedCount?: string;
}

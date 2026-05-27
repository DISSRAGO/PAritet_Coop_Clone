import { SalesWareHouse } from './SalesWareHouse';
import { Abonent } from './Abonent';

/**
 * Access
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Access {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** WareHouse */
  WareHouse?: SalesWareHouse;
  /** Abonent */
  Abonent?: Abonent;
  /** s:string */
  AccessType?: string;
}

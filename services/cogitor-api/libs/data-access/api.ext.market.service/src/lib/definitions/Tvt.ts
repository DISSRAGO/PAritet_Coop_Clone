import { DeliveryAddress } from './DeliveryAddress';
import { OpenTime } from './OpenTime';
import { SalesWareHouse } from './SalesWareHouse';
import { Organization } from './Organization';

/**
 * Tvt
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Tvt {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** s:string */
  Name?: string;
  /** s:string */
  Description?: string;
  /** Address */
  Address?: DeliveryAddress;
  /** Distributor */
  Distributor?: DeliveryAddress;
  /** s:boolean */
  Removed?: string;
  /** OpenTime */
  OpenTime?: OpenTime;
  /** s:string */
  InternalDescription?: string;
  /** s:string */
  Phone?: string;
  /** SalesWareHouse */
  SalesWareHouse?: SalesWareHouse;
  /** Organization */
  Organization?: Organization;
}

import { Tvt } from './Tvt';

/**
 * SalesWareHouse
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface SalesWareHouse {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** s:string */
  Name?: string;
  /** s:string */
  Description?: string;
  /** Tvt */
  Tvt?: Tvt;
}

import { Sosedi } from './Sosedi';
import { House } from './House';
import { FlatInfo } from './FlatInfo';

/**
 * Flat
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Flat {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** s:string */
  Name?: string;
  /** s:string */
  IsMyFlat?: string;
  /** Sosedi */
  Sosedi?: Sosedi;
  /** House */
  House?: House;
  /** s:string */
  ProxyObjectId?: string;
  /** s:string */
  AddressName?: string;
  /** s:string */
  CanEdit?: string;
  /** s:string */
  CanVerify?: string;
  /** s:string */
  CanAddElements?: string;
  /** FlatInfo */
  FlatInfo?: FlatInfo;
}

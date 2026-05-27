import { House } from './House';
import { Porch } from './Porch';
import { ExtendedValues } from './ExtendedValues';

/**
 * ConstructiveElement
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface ConstructiveElement {
  /** House */
  House?: House;
  /** Name */
  Name?: Porch;
  /** s:string */
  Type?: string;
  /** s:string */
  TypeId?: string;
  /** Deterioration */
  Deterioration?: Porch;
  /** LastRepairYear */
  LastRepairYear?: Porch;
  /** NextRepairYear */
  NextRepairYear?: Porch;
  /** Cost */
  Cost?: Porch;
  /** Description */
  Description?: Porch;
  /** TypeRepair */
  TypeRepair?: Porch;
  /** MunicipalMoney */
  MunicipalMoney?: Porch;
  /** ViewDate */
  ViewDate?: Porch;
  /** ExtendedValues */
  ExtendedValues?: ExtendedValues;
  /** s:string */
  ProxyObjectId?: string;
  /** s:string */
  CanEdit?: string;
  /** s:string */
  CanVerify?: string;
  /** s:string */
  CanAddElements?: string;
}

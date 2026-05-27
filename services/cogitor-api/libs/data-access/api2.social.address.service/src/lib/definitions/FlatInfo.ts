import { Flat } from './Flat';
import { Porch } from './Porch';
import { ExtendedValues } from './ExtendedValues';

/**
 * FlatInfo
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface FlatInfo {
  /** Flat */
  Flat?: Flat;
  /** Porch */
  Porch?: Porch;
  /** Floor */
  Floor?: Porch;
  /** LivingArea */
  LivingArea?: Porch;
  /** TotalArea */
  TotalArea?: Porch;
  /** FlatType */
  FlatType?: Porch;
  /** BalconyArea */
  BalconyArea?: Porch;
  /** KitchenArea */
  KitchenArea?: Porch;
  /** CeilingHeight */
  CeilingHeight?: Porch;
  /** RoomsCount */
  RoomsCount?: Porch;
  /** OwnershipType */
  OwnershipType?: Porch;
  /** ExtendedValues */
  ExtendedValues?: ExtendedValues;
}

import { Director } from './Director';
import { Organization } from './Organization';

/**
 * Abonent
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Abonent {
  /** Human */
  Human?: Director;
  /** Organization */
  Organization?: Organization;
}

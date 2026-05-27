import { Human } from './Human';
import { Organization } from './Organization';

/**
 * Abonent
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Abonent {
  /** Human */
  Human?: Human;
  /** Organization */
  Organization?: Organization;
}

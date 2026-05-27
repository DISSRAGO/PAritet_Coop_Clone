import { Organization } from './Organization';

/**
 * CooperativeSector
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface CooperativeSector {
  /** s:string */
  Id?: string;
  /** s:string */
  Name?: string;
  /** s:string */
  Description?: string;
  /** Organization */
  Organization?: Organization;
}

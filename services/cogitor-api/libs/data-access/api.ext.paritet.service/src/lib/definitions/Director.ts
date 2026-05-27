import { Passport } from './Passport';

/**
 * Director
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Director {
  /** Passport */
  Passport?: Passport;
  /** s:string */
  AAddress?: string;
  /** s:string */
  Snils?: string;
}

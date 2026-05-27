import { Passport } from './Passport';

/**
 * Human
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Human {
  /** Passport */
  Passport?: Passport;
  /** s:string */
  AAddress?: string;
  /** s:string */
  Snils?: string;
}

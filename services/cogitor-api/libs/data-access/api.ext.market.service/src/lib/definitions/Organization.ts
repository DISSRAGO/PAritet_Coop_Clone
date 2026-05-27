import { Director } from './Director';

/**
 * Organization
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Organization {
  attributes: {
    ClientId: string;
    Id: string;
    Title: string;
  };
  /** Director */
  Director?: Director;
}

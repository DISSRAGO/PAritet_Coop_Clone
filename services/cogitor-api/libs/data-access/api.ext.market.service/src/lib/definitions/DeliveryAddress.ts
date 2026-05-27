import { AdditionalProps } from './AdditionalProps';

/**
 * DeliveryAddress
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface DeliveryAddress {
  /** s:string */
  Id?: string;
  /** s:string */
  Name?: string;
  /** s:string */
  Value?: string;
  /** AdditionalProps */
  AdditionalProps?: AdditionalProps;
}

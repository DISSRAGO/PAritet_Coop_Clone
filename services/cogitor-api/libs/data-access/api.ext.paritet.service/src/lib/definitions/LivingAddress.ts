/**
 * LivingAddress
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */

export interface ILivingAddressItem {
  attributes: {
    LivingAddressKey: string;
  };
  $value: string;
}
export interface LivingAddress {
  /** s:string */
  LivingAddressItem?: Array<ILivingAddressItem>;
}

import { TypeMoneyList } from './TypeMoneyList';

/**
 * PaymentType
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface PaymentType {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** s:string */
  Name?: string;
  /** s:string */
  Code?: string;
  /** s:boolean */
  Enabled?: string;
  /** s:boolean */
  Available?: string;
  /** s:long */
  PrepayPercent?: string;
  /** TypeMoneyList */
  TypeMoneyList?: TypeMoneyList;
}

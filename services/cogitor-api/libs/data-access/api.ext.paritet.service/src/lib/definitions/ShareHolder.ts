import { Account } from './Account';
import { UserProfile } from './UserProfile';
import { Organization } from './Organization';
import { CooperativeSector } from './CooperativeSector';

/**
 * ShareHolder
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface ShareHolder {
  /** s:string */
  Id?: string;
  /** s:long */
  Status?: string;
  /** s:string */
  ContractId?: string;
  /** s:string */
  StateName?: string;
  /** s:string */
  DateRegister?: string;
  /** AccountDto */
  Account?: Account;
  /** s:string */
  OperationPayment?: string;
  /** Referrer */
  Referrer?: ShareHolder;
  /** UserProfile */
  UserProfile?: UserProfile;
  /** s:double */
  TotalDebts?: string;
  /** s:double */
  TotalDebtsWithBalance?: string;
  /** s:double */
  TotalDebtsWithComission?: string;
  /** s:double */
  RecomendedPayWithComission?: string;
  /** s:string */
  PayLink?: string;
  /** s:string */
  PayLinkSber?: string;
  /** s:string */
  SocialGroupId?: string;
  /** s:string */
  Prefix?: string;
  /** Organization */
  Organization?: Organization;
  /** CooperativeSector */
  CooperativeSector?: CooperativeSector;
}

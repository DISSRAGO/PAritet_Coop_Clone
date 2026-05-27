import { DeliveryAddress } from './DeliveryAddress';
import { DistributionContract } from './DistributionContract';
import { OwnTvtList } from './OwnTvtList';
import { ActionList } from './ActionList';
import { Organization } from './Organization';

/**
 * Goods
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface Goods {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** s:string */
  Name?: string;
  /** s:string */
  Description?: string;
  /** s:string */
  ShortDescription?: string;
  /** Unit */
  Unit?: DeliveryAddress;
  /** s:double */
  Count?: number;
  /** s:double */
  AvailableCount?: number;
  /** s:double */
  MinCount?: number;
  /** s:boolean */
  Enabled?: boolean;
  /** ProductClass */
  ProductClass?: DeliveryAddress;
  /** Price */
  Price?: DeliveryAddress;
  /** Producer */
  Producer?: DeliveryAddress;
  /** DistributorContract */
  DistributorContract?: DistributionContract;
  /** OwnTvtList */
  OwnTvtList?: OwnTvtList;
  /** s:string */
  InternalDescription?: string;
  /** ActionList */
  ActionList?: ActionList;
  /** s:string */
  State?: string;
  /** s:string */
  StateDescription?: string;
  /** s:boolean */
  ShowButtonSaveAsDraft?: string;
  /** s:boolean */
  ShowButtonPublish?: string;
  /** s:boolean */
  Newest?: string;
  /** Organization */
  Organization?: Organization;
  /** s:string */
  InnerBarCode?: string;
  /** s:string */
  OuterBarCode?: string;
  /** s:boolean */
  ShowOverTheWorld?: string;
  /** s:boolean */
  Hidden?: string;
}

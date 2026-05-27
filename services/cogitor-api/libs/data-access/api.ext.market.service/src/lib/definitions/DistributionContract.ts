import { DeliveryAddress } from './DeliveryAddress';
import { AvailablePaymentList } from './AvailablePaymentList';
import { Organization } from './Organization';

/**
 * DistributionContract
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface DistributionContract {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** s:string */
  DateCreate?: string;
  /** Distributor */
  Distributor?: DeliveryAddress;
  /** Producer */
  Producer?: DeliveryAddress;
  /** TypeList */
  TypeList?: AvailablePaymentList;
  /** s:boolean */
  IsSameAbonent?: string;
  /** Status */
  Status?: DeliveryAddress;
  /** s:string */
  Description?: string;
  /** s:string */
  CommentProducer?: string;
  /** s:string */
  CommentDistributor?: string;
  /** Organization */
  Organization?: Organization;
}

import { Status } from './Status';
import { AvailablePaymentList } from './AvailablePaymentList';
import { DeliveryAddress } from './DeliveryAddress';

/** GetParamsForNewDistributionContractResponse */
export interface GetParamsForNewDistributionContractResponse {
  /** Status */
  Status?: Status;
  /** TypeList */
  TypeList?: AvailablePaymentList;
  /** Producer */
  Producer?: DeliveryAddress;
  /** Distributor */
  Distributor?: DeliveryAddress;
}

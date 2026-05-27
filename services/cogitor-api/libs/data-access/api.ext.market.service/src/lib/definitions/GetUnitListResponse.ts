import { Status } from './Status';
import { AvailablePaymentList } from './AvailablePaymentList';

/** GetUnitListResponse */
export interface GetUnitListResponse {
  /** Status */
  Status?: Status;
  /** UnitList */
  UnitList?: AvailablePaymentList;
}

import { Status } from './Status';
import { AvailablePaymentList } from './AvailablePaymentList';

/** GetCashInCashBoxListResponse */
export interface GetCashInCashBoxListResponse {
  /** Status */
  Status?: Status;
  /** CashInCashBoxList */
  CashInCashBoxList?: AvailablePaymentList;
}

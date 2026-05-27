import { Status } from './Status';
import { AvailablePaymentList } from './AvailablePaymentList';

/** GetPersonalListResponse */
export interface GetPersonalListResponse {
  /** Status */
  Status?: Status;
  /** PersonalList */
  PersonalList?: AvailablePaymentList;
}

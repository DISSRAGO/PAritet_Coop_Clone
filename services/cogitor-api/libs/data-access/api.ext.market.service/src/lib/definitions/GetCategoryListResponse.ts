import { Status } from './Status';
import { AvailablePaymentList } from './AvailablePaymentList';

/** GetCategoryListResponse */
export interface GetCategoryListResponse {
  /** Status */
  Status?: Status;
  /** CategoryList */
  CategoryList?: AvailablePaymentList;
}

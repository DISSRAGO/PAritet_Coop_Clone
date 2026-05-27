import { Status } from './Status';
import { AvailablePaymentList } from './AvailablePaymentList';

/** GetMainCategoryListResponse */
export interface GetMainCategoryListResponse {
  /** Status */
  Status?: Status;
  /** CategoryList */
  CategoryList?: AvailablePaymentList;
}

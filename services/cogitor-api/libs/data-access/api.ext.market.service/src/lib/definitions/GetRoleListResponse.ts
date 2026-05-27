import { Status } from './Status';
import { AvailablePaymentList } from './AvailablePaymentList';

/** GetRoleListResponse */
export interface GetRoleListResponse {
  /** Status */
  Status?: Status;
  /** RoleList */
  RoleList?: AvailablePaymentList;
}

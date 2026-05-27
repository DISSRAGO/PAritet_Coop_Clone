import { Status } from './Status';
import { DeliveryAddress } from './DeliveryAddress';

/** GetRoleResponse */
export interface GetRoleResponse {
  /** Status */
  Status?: Status;
  /** Role */
  Role?: DeliveryAddress;
}

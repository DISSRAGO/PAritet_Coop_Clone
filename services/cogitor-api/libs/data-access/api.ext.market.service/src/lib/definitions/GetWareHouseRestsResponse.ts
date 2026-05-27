import { Status } from './Status';
import { RestList } from './RestList';

/** GetWareHouseRestsResponse */
export interface GetWareHouseRestsResponse {
  /** Status */
  Status?: Status;
  /** RestList */
  RestList?: RestList;
  /** s:long */
  AllCount?: string;
}

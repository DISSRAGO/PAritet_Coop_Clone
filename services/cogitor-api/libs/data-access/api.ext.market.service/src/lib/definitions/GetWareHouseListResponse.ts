import { Status } from './Status';
import { WareHouseList } from './WareHouseList';

/** GetWareHouseListResponse */
export interface GetWareHouseListResponse {
  /** Status */
  Status?: Status;
  /** WareHouseList */
  WareHouseList?: WareHouseList;
  /** s:long */
  AllCount?: string;
}

import { Status } from './Status';
import { GoodsList } from './GoodsList';

/** GetGoodsListResponse */
export interface GetGoodsListResponse {
  /** Status */
  Status?: Status;
  /** GoodsList */
  GoodsList?: GoodsList;
  /** s:long */
  AllCount?: string;
}

import { Status } from './Status';
import { GoodsList } from './GoodsList';

/** GetNewestGoodsListResponse */
export interface GetNewestGoodsListResponse {
  /** Status */
  Status?: Status;
  /** GoodsList */
  GoodsList?: GoodsList;
  /** s:long */
  AllCount?: string;
}

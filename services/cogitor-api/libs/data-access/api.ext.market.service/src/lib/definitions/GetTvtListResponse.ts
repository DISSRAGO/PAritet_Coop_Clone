import { Status } from './Status';
import { TvtList } from './TvtList';

/** GetTvtListResponse */
export interface GetTvtListResponse {
  /** Status */
  Status?: Status;
  /** TvtList */
  TvtList?: TvtList;
  /** s:long */
  AllCount?: string;
}

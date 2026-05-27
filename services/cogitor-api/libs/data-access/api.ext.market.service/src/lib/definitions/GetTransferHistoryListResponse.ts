import { Status } from './Status';
import { TransferHistoryList } from './TransferHistoryList';

/** GetTransferHistoryListResponse */
export interface GetTransferHistoryListResponse {
  /** Status */
  Status?: Status;
  /** TransferHistoryList */
  TransferHistoryList?: TransferHistoryList;
  /** s:long */
  AllCount?: string;
}

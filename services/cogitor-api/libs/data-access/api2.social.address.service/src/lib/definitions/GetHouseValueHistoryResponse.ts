import { Status } from './Status';
import { House } from './House';
import { HistoryRecords1 } from './HistoryRecords1';

/** GetHouseValueHistoryResponse */
export interface GetHouseValueHistoryResponse {
  /** Status */
  Status?: Status;
  /** House */
  House?: House;
  /** HistoryRecords */
  HistoryRecords?: HistoryRecords1;
}

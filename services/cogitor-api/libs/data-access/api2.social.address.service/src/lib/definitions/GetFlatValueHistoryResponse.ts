import { Status } from './Status';
import { Flat } from './Flat';
import { HistoryRecords } from './HistoryRecords';

/** GetFlatValueHistoryResponse */
export interface GetFlatValueHistoryResponse {
  /** Status */
  Status?: Status;
  /** Flat */
  Flat?: Flat;
  /** HistoryRecords */
  HistoryRecords?: HistoryRecords;
  /** s:string */
  IsExtendValue?: string;
}

import { Status } from './Status';
import { ConstructiveElement } from './ConstructiveElement';
import { HistoryRecords } from './HistoryRecords';

/** GetConstructiveElementValueHistoryResponse */
export interface GetConstructiveElementValueHistoryResponse {
  /** Status */
  Status?: Status;
  /** Element */
  Element?: ConstructiveElement;
  /** HistoryRecords */
  HistoryRecords?: HistoryRecords;
  /** s:string */
  IsExtendValue?: string;
}

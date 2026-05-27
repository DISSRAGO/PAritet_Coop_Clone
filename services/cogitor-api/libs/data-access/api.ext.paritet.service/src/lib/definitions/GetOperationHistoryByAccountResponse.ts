import { Status } from './Status';
import { OperationList } from './OperationList';

/** GetOperationHistoryByAccountResponse */
export interface GetOperationHistoryByAccountResponse {
  /** Status */
  Status?: Status;
  /** OperationList */
  OperationList?: OperationList;
  /** s:string */
  BalanceBegin?: string;
  /** s:string */
  BalanceEnd?: string;
  /** s:string */
  TotalDebit?: string;
  /** s:string */
  TotalCredit?: string;
}

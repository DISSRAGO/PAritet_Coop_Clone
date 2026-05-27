import { Status } from './Status';

/** CheckPaymentTypeForTradeResponse */
export interface CheckPaymentTypeForTradeResponse {
  /** Status */
  Status?: Status;
  /** s:string */
  CanTrade?: string;
  /** s:string */
  CountEnableTvt?: string;
}

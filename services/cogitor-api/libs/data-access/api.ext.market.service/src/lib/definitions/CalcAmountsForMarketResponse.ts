import { Status } from './Status';

/** CalcAmountsForMarketResponse */
export interface CalcAmountsForMarketResponse {
  /** Status */
  Status?: Status;
  /** s:string */
  NewPrice?: string;
  /** s:string */
  NewPriceForShareHolder?: string;
  /** s:string */
  NewProffit?: string;
  /** s:string */
  NewOperationFee?: string;
}

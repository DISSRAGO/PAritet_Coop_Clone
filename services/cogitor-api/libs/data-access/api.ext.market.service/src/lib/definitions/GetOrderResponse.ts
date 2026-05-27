import { Status } from './Status';
import { Order } from './Order';

/** GetOrderResponse */
export interface GetOrderResponse {
  /** Status */
  Status?: Status;
  /** Order */
  Order?: Order;
}

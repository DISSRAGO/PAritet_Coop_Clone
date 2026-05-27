import { Status } from './Status';
import { SalesWareHouse } from './SalesWareHouse';

/** GetWareHouseByIdResponse */
export interface GetWareHouseByIdResponse {
  /** Status */
  Status?: Status;
  /** WareHouse */
  WareHouse?: SalesWareHouse;
}

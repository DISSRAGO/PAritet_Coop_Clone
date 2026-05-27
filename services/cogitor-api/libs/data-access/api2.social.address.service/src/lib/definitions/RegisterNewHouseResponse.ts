import { Status } from './Status';

/** RegisterNewHouseResponse */
export interface RegisterNewHouseResponse {
  /** Status */
  Status?: Status;
  /** s:string */
  HouseId?: string;
  /** s:boolean */
  Exists?: string;
}

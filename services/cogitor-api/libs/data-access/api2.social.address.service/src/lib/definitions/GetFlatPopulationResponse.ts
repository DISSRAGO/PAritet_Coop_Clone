import { Status } from './Status';
import { Sosedi } from './Sosedi';

/** GetFlatPopulationResponse */
export interface GetFlatPopulationResponse {
  /** Status */
  Status?: Status;
  /** s:string */
  AllCount?: string;
  /** Avatars */
  Avatars?: Sosedi;
}

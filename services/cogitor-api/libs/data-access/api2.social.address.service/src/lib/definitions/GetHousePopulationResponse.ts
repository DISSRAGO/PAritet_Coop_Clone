import { Status } from './Status';
import { LivingFlats } from './LivingFlats';
import { Sosedi } from './Sosedi';

/** GetHousePopulationResponse */
export interface GetHousePopulationResponse {
  /** Status */
  Status?: Status;
  /** s:string */
  AllCount?: string;
  /** LivingFlats */
  LivingFlats?: LivingFlats;
  /** s:string */
  MyFlat?: string;
  /** Avatars */
  Avatars?: Sosedi;
}

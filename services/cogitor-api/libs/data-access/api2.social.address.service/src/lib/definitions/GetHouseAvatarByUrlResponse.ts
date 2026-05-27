import { Status } from './Status';
import { Avatar } from './Avatar';

/** GetHouseAvatarByUrlResponse */
export interface GetHouseAvatarByUrlResponse {
  /** Status */
  Status?: Status;
  /** s:string */
  HouseId?: string;
  /** Avatar */
  Avatar?: Avatar;
}

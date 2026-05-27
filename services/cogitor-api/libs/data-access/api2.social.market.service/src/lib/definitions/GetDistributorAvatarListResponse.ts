import { Status } from "./Status";
import { AvatarList } from "./AvatarList";

/** GetDistributorAvatarListResponse */
export interface GetDistributorAvatarListResponse {
    /** Status */
    Status?: Status;
    /** AvatarList */
    AvatarList?: AvatarList;
    /** s:long */
    AllCount?: string;
}

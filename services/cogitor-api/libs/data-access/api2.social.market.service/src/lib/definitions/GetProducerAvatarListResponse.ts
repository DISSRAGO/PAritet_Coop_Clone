import { Status } from "./Status";
import { AvatarList } from "./AvatarList";

/** GetProducerAvatarListResponse */
export interface GetProducerAvatarListResponse {
    /** Status */
    Status?: Status;
    /** AvatarList */
    AvatarList?: AvatarList;
    /** s:long */
    AllCount?: string;
}

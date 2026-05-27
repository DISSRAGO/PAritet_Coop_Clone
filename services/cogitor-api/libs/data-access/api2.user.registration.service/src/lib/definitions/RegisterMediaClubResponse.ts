import { Status } from './Status';
import { ContainerLinkList } from './ContainerLinkList';

/** RegisterMediaClubResponse */
export interface RegisterMediaClubResponse {
  /** Status */
  Status?: Status;
  /** s:string */
  AbonentId?: string;
  /** ContainerLinkList */
  ContainerLinkList?: ContainerLinkList;
}

import { Status } from './Status';
import { ContainerLinkList } from './ContainerLinkList';

/** RegisterMailBoxResponse */
export interface RegisterMailBoxResponse {
  /** Status */
  Status?: Status;
  /** s:string */
  AbonentId?: string;
  /** ContainerLinkList */
  ContainerLinkList?: ContainerLinkList;
}

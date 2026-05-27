import { Status } from './Status';
import { ContainerLinkList } from './ContainerLinkList';

/** PayResponse */
export interface PayResponse {
  /** Status */
  Status?: Status;
  /** ContainerLinkList */
  ContainerLinkList?: ContainerLinkList;
}

import { Status } from './Status';
import { ExternalSource } from './ExternalSource';

/** GetObjectPropertyListResponse */
export interface GetObjectPropertyListResponse {
  /** Status */
  Status?: Status;
  /** ObjectProperties */
  ObjectProperties?: ExternalSource;
}

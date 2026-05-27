import { Status } from './Status';

/** CreateResponse */
export interface CreateResponse {
  /** Status */
  Status?: Status;
  /** s:string */
  Code?: string;
  /** s:string */
  ActivationRequestId?: string;
  /** s:string */
  Param?: string;
}

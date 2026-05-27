import { Status } from './Status';

/** GetUserStatusInParitetResponse */
export interface GetUserStatusInParitetResponse {
  /** Status */
  Status?: Status;
  /** s:boolean */
  IsShareHolder?: string;
  /** s:string */
  UserName?: string;
  /** s:string */
  OrgPrefix?: string;
}

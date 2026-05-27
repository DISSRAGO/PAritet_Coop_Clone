import { Status } from './Status';

/** SendConfirmCodeResponse */
export interface SendConfirmCodeResponse {
  /** Status */
  Status?: Status;
  /** s:string */
  ActivationCode?: string;
}

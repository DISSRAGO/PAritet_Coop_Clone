import { Status } from './Status';
import { Account } from './Account';

/** GetAccountResponse */
export interface GetAccountResponse {
  /** Status */
  Status?: Status;
  /** AccountDto */
  Account?: Account;
}

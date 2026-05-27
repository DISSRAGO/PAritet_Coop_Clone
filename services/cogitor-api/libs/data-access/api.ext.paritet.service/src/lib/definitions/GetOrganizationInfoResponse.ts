import { Status } from './Status';
import { Organization } from './Organization';

/** GetOrganizationInfoResponse */
export interface GetOrganizationInfoResponse {
  /** Status */
  Status?: Status;
  /** Organization */
  Organization?: Organization;
  /** s:string */
  SocialGroupId?: string;
}

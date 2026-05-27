import { UserProfile } from './UserProfile';

/** SaveUserProfile */
export interface SaveUserProfile {
  /** s:string */
  UserId?: string;
  /** s:string */
  Prefix?: string;
  /** s:string */
  OrganizationId?: string;
  /** s:boolean */
  UseOrganizationFilter?: string;
  /** UserProfile */
  UserProfile?: UserProfile;
  /** s:boolean */
  SaveOnlyLivingAddress?: string;
}

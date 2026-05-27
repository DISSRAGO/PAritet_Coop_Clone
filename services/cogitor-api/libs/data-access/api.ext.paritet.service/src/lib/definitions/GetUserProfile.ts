import { PropertyList } from './PropertyList';

/** GetUserProfile */
export interface GetUserProfile {
  /** s:string */
  UserId?: string;
  /** s:string */
  Prefix?: string;
  /** s:string */
  OrganizationId?: string;
  /** s:boolean */
  UseOrganizationFilter?: string;
  /** s:boolean */
  DontCheckAccess?: string;
  /** PropertyList */
  PropertyList?: PropertyList;
}

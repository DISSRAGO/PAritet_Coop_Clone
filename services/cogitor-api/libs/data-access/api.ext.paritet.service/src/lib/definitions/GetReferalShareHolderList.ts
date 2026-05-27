import { PropertyList } from './PropertyList';

/** GetReferalShareHolderList */
export interface GetReferalShareHolderList {
  /** s:string */
  UserId?: string;
  /** s:string */
  Prefix?: string;
  /** s:string */
  OrganizationId?: string;
  /** PropertyList */
  PropertyList?: PropertyList;
}

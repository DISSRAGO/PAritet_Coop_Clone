import { PropertyList } from './PropertyList';

/** GetOrderList */
export interface GetOrderList {
  /** s:string */
  RoleId?: string;
  /** s:string */
  Prefix?: string;
  /** s:string */
  OrganizationId?: string;
  /** PropertyList */
  PropertyList?: PropertyList;
  /** s:string */
  ShowHistory?: string;
}

import { PropertyList } from './PropertyList';

/** GetDistributionContractList */
export interface GetDistributionContractList {
  /** s:string */
  RoleId?: string;
  /** s:string */
  Prefix?: string;
  /** s:string */
  OrganizationId?: string;
  /** s:boolean */
  ShowBlocked?: string;
  /** s:string */
  SortName?: string;
  /** s:string */
  SortOrder?: string;
  /** PropertyList */
  PropertyList?: PropertyList;
}

import { PropertyList } from './PropertyList';

/** GetGoodsList */
export interface GetGoodsList {
  /** s:string */
  Prefix?: string;
  /** s:string */
  OrganizationId?: string;
  /** s:boolean */
  UseOrganizationFilter?: string;
  /** s:string */
  CategoryId?: string;
  /** s:string */
  ProducerId?: string;
  /** s:string */
  DistributorId?: string;
  /** s:string */
  AbonentId?: string;
  /** s:string */
  ShowEnabled?: string;
  /** s:string */
  ShowHidden?: string;
  /** s:boolean */
  LocationFilter?: string;
  /** s:string */
  Sort?: string;
  /** s:string */
  Order?: string;
  /** s:string */
  ContextSearch?: string;
  /** s:long */
  PositionFrom?: string;
  /** s:long */
  MaxCount?: string;
  /** PropertyList */
  PropertyList?: PropertyList;
}

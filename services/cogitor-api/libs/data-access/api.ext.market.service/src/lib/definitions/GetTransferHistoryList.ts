import { PropertyList } from './PropertyList';

/** GetTransferHistoryList */
export interface GetTransferHistoryList {
  /** s:string */
  Prefix?: string;
  /** s:string */
  OrganizationId?: string;
  /** s:boolean */
  UseOrganizationFilter?: string;
  /** s:string */
  WareHouseId?: string;
  /** s:string */
  DistributorId?: string;
  /** s:string */
  ProductId?: string;
  /** s:string */
  Operation?: string;
  /** s:string */
  DateFrom?: string;
  /** s:string */
  DateTo?: string;
  /** s:string */
  Sort?: string;
  /** s:string */
  Order?: string;
  /** s:long */
  PositionFrom?: string;
  /** s:long */
  MaxCount?: string;
  /** PropertyList */
  PropertyList?: PropertyList;
}

import { PropertyList } from './PropertyList';

/** GetTvtList */
export interface GetTvtList {
  /** s:string */
  Prefix?: string;
  /** s:string */
  OrganizationId?: string;
  /** s:string */
  ProducerId?: string;
  /** s:string */
  DistributorId?: string;
  /** s:boolean */
  LocationFilter?: string;
  /** s:long */
  PositionFrom?: string;
  /** s:long */
  MaxCount?: string;
  /** PropertyList */
  PropertyList?: PropertyList;
}

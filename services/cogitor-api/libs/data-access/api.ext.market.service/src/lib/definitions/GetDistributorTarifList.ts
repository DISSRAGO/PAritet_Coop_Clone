import { PropertyList } from './PropertyList';

/** GetDistributorTarifList */
export interface GetDistributorTarifList {
  /** s:string */
  ProductId?: string;
  /** s:string */
  DistributorId?: string;
  /** s:boolean */
  LocationFilter?: string;
  /** s:boolean */
  ShowAvailable?: string;
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

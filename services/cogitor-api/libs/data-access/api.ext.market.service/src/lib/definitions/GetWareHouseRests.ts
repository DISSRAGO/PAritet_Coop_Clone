import { PropertyList } from './PropertyList';

/** GetWareHouseRests */
export interface GetWareHouseRests {
  /** s:string */
  WareHouseId?: string;
  /** s:long */
  PositionFrom?: string;
  /** s:long */
  MaxCount?: string;
  /** PropertyList */
  PropertyList?: PropertyList;
}

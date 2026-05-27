import { PropertyList } from './PropertyList';

/** GetHouseInformation */
export interface GetHouseInformation {
  /** s:string */
  HouseId?: string;
  /** s:string */
  CheckVisit?: string;
  /** s:string */
  IP?: string;
  /** PropertyList */
  PropertyList?: PropertyList;
}

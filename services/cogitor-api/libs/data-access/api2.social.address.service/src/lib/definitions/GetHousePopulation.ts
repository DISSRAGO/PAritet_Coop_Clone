import { PropertyList } from './PropertyList';

/** GetHousePopulation */
export interface GetHousePopulation {
  /** s:string */
  HouseId?: string;
  /** PropertyList */
  PropertyList?: PropertyList;
  /** s:string */
  PositionFrom?: string;
  /** s:string */
  MaxCount?: string;
}

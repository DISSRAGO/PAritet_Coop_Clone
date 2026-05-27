import { Status } from './Status';

/** GetAddressFullIdsResponse */
export interface GetAddressFullIdsResponse {
  /** Status */
  Status?: Status;
  /** s:string */
  CountryId?: string;
  /** s:string */
  RegionId?: string;
  /** s:string */
  CityId?: string;
  /** s:string */
  StreetId?: string;
  /** s:string */
  HouseName?: string;
}

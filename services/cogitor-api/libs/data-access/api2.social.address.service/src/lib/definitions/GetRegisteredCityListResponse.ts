import { Status } from './Status';
import { CityList } from './CityList';

/** GetRegisteredCityListResponse */
export interface GetRegisteredCityListResponse {
  /** Status */
  Status?: Status;
  /** CityList */
  CityList?: CityList;
  /** s:string */
  TotalCount?: string;
}

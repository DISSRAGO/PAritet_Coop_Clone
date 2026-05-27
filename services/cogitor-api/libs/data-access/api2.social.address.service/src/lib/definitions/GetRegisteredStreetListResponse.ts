import { Status } from './Status';
import { StreetList } from './StreetList';

/** GetRegisteredStreetListResponse */
export interface GetRegisteredStreetListResponse {
  /** Status */
  Status?: Status;
  /** StreetList */
  StreetList?: StreetList;
  /** s:string */
  TotalCount?: string;
}

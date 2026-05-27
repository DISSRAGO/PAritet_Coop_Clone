import { Status } from './Status';
import { DistributorTarifList } from './DistributorTarifList';

/** GetDistributorTarifListResponse */
export interface GetDistributorTarifListResponse {
  /** Status */
  Status?: Status;
  /** DistributorTarifList */
  DistributorTarifList?: DistributorTarifList;
  /** s:long */
  AllCount?: string;
}

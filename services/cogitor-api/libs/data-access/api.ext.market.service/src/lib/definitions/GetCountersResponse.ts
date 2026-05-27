import { Status } from './Status';

/** GetCountersResponse */
export interface GetCountersResponse {
  /** Status */
  Status?: Status;
  /** s:long */
  ContractCountForProducer?: string;
  /** s:long */
  ContractCountForDistributor?: string;
  /** s:long */
  OrderCountForProducer?: string;
  /** s:long */
  OrderCountForDistributor?: string;
  /** s:long */
  OrderCountForCustomer?: string;
  /** s:long */
  PersonalCountForDistributor?: string;
}

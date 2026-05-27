import { AvailablePaymentList } from './AvailablePaymentList';

/** SaveDistributorTarifListByDistributor */
export interface SaveDistributorTarifListByDistributor {
  /** s:string */
  DistributorId?: string;
  /** s:string */
  GoodsId?: string;
  /** DistributorTarifList */
  DistributorTarifList?: AvailablePaymentList;
}

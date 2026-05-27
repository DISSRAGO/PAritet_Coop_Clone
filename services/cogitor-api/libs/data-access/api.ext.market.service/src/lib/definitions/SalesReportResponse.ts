import { Status } from './Status';
import { DeliveryAddress } from './DeliveryAddress';

/** SalesReportResponse */
export interface SalesReportResponse {
  /** Status */
  Status?: Status;
  /** ReportItems[] */
  ReportItems?: Array<DeliveryAddress>;
}

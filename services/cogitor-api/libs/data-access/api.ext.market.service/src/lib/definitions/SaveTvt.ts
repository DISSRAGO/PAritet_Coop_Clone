import { OpenTime } from './OpenTime';
import { PaymentTypeList1 } from './PaymentTypeList1';

/** SaveTvt */
export interface SaveTvt {
  /** s:string */
  ID?: string;
  /** s:string */
  Name?: string;
  /** s:string */
  Description?: string;
  /** s:string */
  DistributorId?: string;
  /** s:string */
  CityId?: string;
  /** s:string */
  StreetId?: string;
  /** s:string */
  HouseId?: string;
  /** s:string */
  Address?: string;
  /** s:boolean */
  Removed?: string;
  /** OpenTime */
  OpenTime?: OpenTime;
  /** s:string */
  InternalDescription?: string;
  /** s:string */
  Phone?: string;
  /** PaymentTypeList */
  PaymentTypeList?: PaymentTypeList1;
  /** s:string */
  SalesWareHouseId?: string;
  /** s:string */
  OrganizationId?: string;
}

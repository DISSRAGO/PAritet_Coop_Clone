import { AbonentPropertyList } from './AbonentPropertyList';

/** GetCashBoxReport */
export interface GetCashBoxReport {
  /** s:string */
  AbonentId?: string;
  /** s:string */
  Prefix?: string;
  /** s:string */
  OrganizationId?: string;
  /** s:string */
  DateFrom?: string;
  /** s:string */
  DateTo?: string;
  /** AbonentPropertyList */
  AbonentPropertyList?: AbonentPropertyList;
}

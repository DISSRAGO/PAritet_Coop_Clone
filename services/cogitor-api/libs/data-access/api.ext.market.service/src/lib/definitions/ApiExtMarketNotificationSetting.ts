import { TransportList } from './TransportList';

/**
 * ApiExt.Market.Notification.Setting
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface ApiExtMarketNotificationSetting {
  /** s:string */
  Name?: string;
  /** s:string */
  Description?: string;
  /** s:string */
  Module?: string;
  /** s:string */
  Code?: string;
  /** TransportList */
  TransportList?: TransportList;
  /** s:string */
  RoleType?: string;
}

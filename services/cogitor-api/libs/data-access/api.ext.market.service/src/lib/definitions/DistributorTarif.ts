import { DeliveryAddress } from './DeliveryAddress';
import { Tvt } from './Tvt';

/**
 * DistributorTarif
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface DistributorTarif {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** s:string */
  DistributionPrice?: string;
  /** s:string */
  Description?: string;
  /** ProducerTarif */
  ProducerTarif?: DeliveryAddress;
  /** Tvt */
  Tvt?: Tvt;
  /** s:boolean */
  Enabled?: string;
  /** s:string */
  Price?: string;
  /** s:string */
  PriceForShareHolder?: string;
  /** s:string */
  PriceOperatingFee?: string;
  /** s:string */
  PriceProffit?: string;
  /** s:boolean */
  PriceAvailable?: string;
  /** s:boolean */
  PriceForShareHolderAvailable?: string;
  /** s:boolean */
  PriceForShareHolderEnabled?: string;
  /** s:long */
  DeliveryDayCount?: string;
  /** Producer */
  Producer?: DeliveryAddress;
  /** s:long */
  Type?: string;
  /** s:double */
  AvailableCount?: string;
}

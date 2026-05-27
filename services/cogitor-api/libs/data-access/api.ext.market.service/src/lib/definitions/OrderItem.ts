import { Goods } from './Goods';

/**
 * OrderItem
 * @targetNSAlias `s0`
 * @targetNamespace `https://www.portmonet.ru`
 */
export interface OrderItem {
  /** s:string */
  Id?: string;
  /** s:string */
  ClassName?: string;
  /** Goods */
  Goods?: Goods;
  /** s:string */
  Count?: string;
  /** s:string */
  Price?: string;
  /** s:string */
  PriceShareHolder?: string;
  /** s:string */
  ProducerPrice?: string;
  /** s:string */
  ProducerShareHolderPrice?: string;
  /** s:string */
  DistributionPrice?: string;
  /** s:double */
  GoodsRestInWareHouse?: string;
}

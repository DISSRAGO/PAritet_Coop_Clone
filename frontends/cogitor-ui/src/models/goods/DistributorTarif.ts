import {ITVT} from "./ITVT";

export interface DistributorTarifDto {
	id?: string;
	className?: string;
	distributionPrice?: string;
	description?: string;
	tvt?: ITVT;
	enabled?: string;
	price?: string;
	priceForShareHolder?: string;
	priceOperatingFee?: string;
	priceProffit?: string;
	priceAvailable?: string;
	priceForShareHolderAvailable?: string;
	priceForShareHolderEnabled?: string;
	deliveryDayCount?: string;
	type?: string;
	availableCount?: number;
}

export interface DistributorTarifTableItem {
  id?: string;
  className?: string;
  distributionPrice?: string;
  description?: string;
  tvt?: ITVT;
  enabled?: string;
  price?: string;
  priceForShareHolder?: string;
  priceOperatingFee?: string;
  priceProffit?: string;
  priceAvailable?: string;
  priceForShareHolderAvailable?: string;
  priceForShareHolderEnabled?: string;
  deliveryDayCount?: string;
  type?: string;
  availableCount?: number;
  count?: number;
}

import {ITVT} from "./ITVT";

export interface IDistributorTarif {
	id?: string;
	distributionPrice?: string;
	description?: string;
	// ProducerTarif?: DeliveryAddress;
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
	// Producer?: DeliveryAddress;
	type?: string;
	availableCount?: string;
}

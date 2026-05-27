import {ProductCategory} from "./ProductCategory";
import {GoodPrice} from "./GoodPrice";
import {Unit} from "./Unit";

export interface DistributionContract {
	Id?: string;
	ClassName?: string;
	DateCreate?: string;
	// Distributor?: DeliveryAddress;
	// Producer?: DeliveryAddress;
	// TypeList?: AvailablePaymentList;
	IsSameAbonent?: string;
	// Status?: DeliveryAddress;
	Description?: string;
	CommentProducer?: string;
	CommentDistributor?: string;
	// Organization?: Organization;
}

export interface GoodInfo {
	id?: string;
	name?: string;
	description?: string;
	shortDescription?: string;
	unit?: Unit;
	count?: number;
	availableCount?: number;
	minCount?: string;
	enabled?: boolean;
	productClass?: ProductCategory;
	price?: GoodPrice;
	producer?: {
		id?: number;
		name?: string;
		value?: string;
	};
	ownTvtList?: Array<number>;
	internalDescription?: string;
	state?: string;
	stateDescription?: string;
	showButtonSaveAsDraft?: boolean;
	showButtonPublish?: boolean;
	newest?: boolean;
	organization?: {
		id: number;
		title: string;
		director: {
			id: number;
			name: string;
		};
	};
	innerBarCode?: string;
	outerBarCode?: string;
	showOverTheWorld?: string;
	hidden?: boolean;
}

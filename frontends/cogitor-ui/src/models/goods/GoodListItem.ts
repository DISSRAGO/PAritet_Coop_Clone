import {Unit} from "./Unit";
import {ProductCategory} from "./ProductCategory";
import {GoodPrice} from "./GoodPrice";

export type GoodListItem = {
	id?: string;
	name?: string;
	shortDescription?: string;
	unit?: Unit;
	enabled?: boolean;
	productClass?: ProductCategory;
	price?: GoodPrice;
	newest?: boolean;
	hidden?: boolean;
	photoURL?: string;
  count: number;
  availableCount: number;
}

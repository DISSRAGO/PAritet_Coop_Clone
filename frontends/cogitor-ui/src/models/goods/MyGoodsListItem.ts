import {GoodPrice} from "./GoodPrice";
import {ProductCategory} from "./ProductCategory";
import {Unit} from "./Unit";

export type MyGoodsListItem = {
  id?: string;
  className?: string;
  name?: string;
  description?: string;
  shortDescription?: string;
  unit?: Unit;
  enabled?: boolean;
  productClass?: ProductCategory;
  price?: GoodPrice;
  showButtonSaveAsDraft?: boolean;
  showButtonPublish?: boolean;
  newest?: boolean;
  hidden?: boolean;
  photoURL?: string;
  state?: string;
  actionList?: Array<string>;
}

export class WorkTime {
	id?: number;
	time?: string;
}
export interface ITVT {
	id?: string;
	name?: string;
	description?: string;
	distributorId?: string;
	cityId?: number;
	streetId?: number;
	houseId?: number;
	address?: string;
	openTime?: Array<WorkTime>;
	internalDescription?: string;
	phone?: string;
	removed?: string;
}

/**
 * export interface ITVT {
 * 	id?: string;
 * 	description?: string;
 * 	distributorId?: string;
 * 	cityId?: string;
 * 	streetId?: string;
 * 	houseId?: string;
 * 	address?: string;
 * 	removed?: string;
 * 	openTime?: Array<string>;
 * 	internalDescription?: string;
 * 	phone?: string;
 * 	paymentTypeList?: Array<string>;
 * 	salesWareHouseId?: string;
 * 	organizationId?: string;
 * }
 */

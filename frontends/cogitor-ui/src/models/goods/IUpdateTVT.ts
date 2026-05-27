export class WorkTime {
	id?: number;
	time?: string;
}
export interface IUpdateTVT {
	id?: string;
	name?: string;
	description?: string;
	distributorId?: string;
	address?: {
		id?: string;
		name?: string;
		value?: string;
		countryId?: number;
		countryName?: string;
		regionId?: number;
		regionName?: string;
		cityId?: number;
		cityName?: string;
		streetId?: number;
		streetName?: string;
		houseId?: number;
		houseName?: string;
	};
	openTime?: Array<WorkTime>;
	internalDescription?: string;
	phone?: string;
	removed?: string;
}
